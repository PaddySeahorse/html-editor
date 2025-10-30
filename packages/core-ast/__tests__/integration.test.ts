import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseHtml,
  toHtmlSync,
  assignIds,
  normalize,
  buildIndexMaps,
  replaceNodeById,
  resetIdCounter,
} from '../src/index.js';
import type { Element } from '../src/types.js';

describe('integration tests', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  it('should handle complete pipeline with blog post HTML', () => {
    const html = `
      <article>
        <header>
          <h1>Blog Post Title</h1>
          <p class="meta">Posted on <time datetime="2024-01-15">January 15, 2024</time></p>
        </header>
        <section>
          <p>This is the first paragraph with <strong>bold text</strong> and <em>italic text</em>.</p>
          <p>Second paragraph with a <a href="https://example.com">link</a>.</p>
          <ul>
            <li>First item</li>
            <li>Second item</li>
            <li>Third item</li>
          </ul>
        </section>
        <footer>
          <p>Author information</p>
        </footer>
      </article>
    `;

    const tree = parseHtml(html);
    assignIds(tree);
    normalize(tree);

    const maps = buildIndexMaps(tree);
    expect(maps.byId.size).toBeGreaterThan(0);

    const result = toHtmlSync(tree);
    expect(result).toContain('Blog Post Title');
    expect(result).toContain('data-editor-id=');
  });

  it('should handle form HTML with various input types', () => {
    const html = `
      <form action="/submit" method="post">
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div class="form-group">
          <label for="message">Message:</label>
          <textarea id="message" name="message" rows="5"></textarea>
        </div>
        <button type="submit">Send</button>
      </form>
    `;

    const tree = parseHtml(html);
    assignIds(tree);

    const maps = buildIndexMaps(tree);
    expect(maps.byId.size).toBeGreaterThan(5);

    const result = toHtmlSync(tree);
    expect(result).toContain('type="text"');
    expect(result).toContain('type="email"');
  });

  it('should handle navigation menu structure', () => {
    const html = `
      <nav role="navigation">
        <ul class="main-menu">
          <li><a href="/">Home</a></li>
          <li>
            <a href="/products">Products</a>
            <ul class="submenu">
              <li><a href="/products/category1">Category 1</a></li>
              <li><a href="/products/category2">Category 2</a></li>
            </ul>
          </li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
    `;

    const tree = parseHtml(html);
    assignIds(tree);
    normalize(tree);

    const result = toHtmlSync(tree);
    expect(result).toContain('main-menu');
    expect(result).toContain('submenu');
  });

  it('should support editing workflow: parse -> modify -> serialize', () => {
    const html = '<div><p id="target">Original text</p><p>Other text</p></div>';

    const tree = parseHtml(html);
    assignIds(tree);

    const maps = buildIndexMaps(tree);
    const targetNode = Array.from(maps.byId.values()).find(
      (node) => node.properties?.id === 'target'
    );

    expect(targetNode).toBeDefined();

    if (targetNode) {
      const nodeId = targetNode.properties?.dataEditorId as string;

      const updatedNode: Element = {
        type: 'element',
        tagName: 'p',
        properties: {
          dataEditorId: nodeId,
          id: 'target',
        },
        children: [{ type: 'text', value: 'Updated text' }],
      };

      replaceNodeById(tree, nodeId, updatedNode);

      const result = toHtmlSync(tree);
      expect(result).toContain('Updated text');
      expect(result).not.toContain('Original text');
      expect(result).toContain('Other text');
    }
  });

  it('should handle table structure', () => {
    const html = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>City</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>30</td>
            <td>New York</td>
          </tr>
          <tr>
            <td>Jane Smith</td>
            <td>25</td>
            <td>Los Angeles</td>
          </tr>
        </tbody>
      </table>
    `;

    const tree = parseHtml(html);
    assignIds(tree);

    const maps = buildIndexMaps(tree);
    expect(maps.byId.size).toBeGreaterThan(10);

    const result = toHtmlSync(tree);
    expect(result).toContain('thead');
    expect(result).toContain('tbody');
    expect(result).toContain('John Doe');
  });

  it('should preserve semantic HTML5 structure', () => {
    const html = `
      <main>
        <article>
          <header>
            <h1>Article Title</h1>
          </header>
          <section>
            <h2>Section 1</h2>
            <p>Content</p>
          </section>
          <aside>
            <h3>Related Info</h3>
            <p>Sidebar content</p>
          </aside>
        </article>
      </main>
    `;

    const tree = parseHtml(html);
    assignIds(tree);

    const result = toHtmlSync(tree);
    expect(result).toContain('main');
    expect(result).toContain('article');
    expect(result).toContain('header');
    expect(result).toContain('section');
    expect(result).toContain('aside');
  });

  it('should handle mixed content with images and media', () => {
    const html = `
      <div class="content">
        <h2>Media Gallery</h2>
        <figure>
          <img src="/images/photo1.jpg" alt="Photo 1" width="800" height="600" />
          <figcaption>Image caption here</figcaption>
        </figure>
        <video controls width="640" height="360">
          <source src="/videos/sample.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    `;

    const tree = parseHtml(html);
    assignIds(tree);

    const result = toHtmlSync(tree);
    expect(result).toContain('figure');
    expect(result).toContain('figcaption');
    expect(result).toContain('video');
  });

  it('should maintain data attributes and aria properties', () => {
    const html = `
      <button
        type="button"
        data-action="submit"
        data-target="#modal"
        aria-label="Submit form"
        aria-pressed="false"
      >
        Submit
      </button>
    `;

    const tree = parseHtml(html);
    assignIds(tree);

    const result = toHtmlSync(tree);
    expect(result).toContain('data-action');
    expect(result).toContain('aria-label');
    expect(result).toContain('aria-pressed');
  });
});
