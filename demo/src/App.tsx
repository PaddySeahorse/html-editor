import { Editor } from '@html-editor/editor-ui';

const initialHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sample Document</title>
</head>
<body>
  <header>
    <h1>HTML Editor Demo</h1>
    <nav>
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  
  <main>
    <article>
      <h2>Welcome to the HTML Editor</h2>
      <p>
        This is a <strong>real-time</strong> HTML editor with 
        <em>bidirectional</em> sync between code and visual canvas.
      </p>
      <p>
        Try clicking on elements in the canvas to see them highlighted 
        in the code editor, or position your cursor in the code to 
        highlight the corresponding element in the canvas.
      </p>
      
      <h3>Features:</h3>
      <ul>
        <li>Live parsing with <code>&lt;100ms</code> latency</li>
        <li>AST-based editing</li>
        <li>Stable node identity</li>
        <li>Error recovery</li>
      </ul>
      
      <blockquote>
        "The best way to predict the future is to create it."
      </blockquote>
    </article>
    
    <aside>
      <h3>Quick Links</h3>
      <ul>
        <li><a href="#docs">Documentation</a></li>
        <li><a href="#examples">Examples</a></li>
        <li><a href="#api">API Reference</a></li>
      </ul>
    </aside>
  </main>
  
  <footer>
    <p>&copy; 2024 HTML Editor Project</p>
  </footer>
</body>
</html>`;

function App() {
  return <Editor initialHtml={initialHtml} debounceMs={75} splitRatio={0.6} />;
}

export default App;
