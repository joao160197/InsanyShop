
// Define a response type for the test API
interface TestApiResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

declare global {
  interface Window {
    testApi: () => Promise<TestApiResponse>;
  }

  
  declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
  }

  declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
  }
}

export {};
declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.styl' {
  const classes: { [key: string]: string };
  export default classes;
}
