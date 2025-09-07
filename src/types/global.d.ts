
declare global {
  interface Window {
    testApi: () => Promise<any>;
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
