declare module 'dompurify' {
  interface Config {
    ALLOWED_TAGS?: string[];
    ALLOWED_ATTR?: string[];
    KEEP_CONTENT?: boolean;
  }

  type Sanitized = string;

  interface DOMPurifyModule {
    sanitize(source: string, config?: Config): Sanitized;
  }

  const DOMPurify: DOMPurifyModule;
  export default DOMPurify;
}
