declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
// 전역 CSS를 사이드이펙트 임포트해야 한다면(비권장) 이것도 추가:
declare module '*.css';
declare module '*.scss';
