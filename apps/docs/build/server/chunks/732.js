"use strict";exports.id=732,exports.ids=[732],exports.modules={2732:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return Error}});let l=r(5248),o=l._(r(6689)),n=l._(r(7529)),i={400:"Bad Request",404:"This page could not be found",405:"Method Not Allowed",500:"Internal Server Error"};function _getInitialProps(e){let{res:t,err:r}=e,l=t&&t.statusCode?t.statusCode:r?r.statusCode:404;return{statusCode:l}}let a={error:{fontFamily:'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',height:"100vh",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},desc:{lineHeight:"48px"},h1:{display:"inline-block",margin:"0 20px 0 0",paddingRight:23,fontSize:24,fontWeight:500,verticalAlign:"top"},h2:{fontSize:14,fontWeight:400,lineHeight:"28px"},wrap:{display:"inline-block"}};let Error=class Error extends o.default.Component{render(){let{statusCode:e,withDarkMode:t=!0}=this.props,r=this.props.title||i[e]||"An unexpected error has occurred";return o.default.createElement("div",{style:a.error},o.default.createElement(n.default,null,o.default.createElement("title",null,e?e+": "+r:"Application error: a client-side exception has occurred")),o.default.createElement("div",{style:a.desc},o.default.createElement("style",{dangerouslySetInnerHTML:{__html:"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}"+(t?"@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}":"")}}),e?o.default.createElement("h1",{className:"next-error-h1",style:a.h1},e):null,o.default.createElement("div",{style:a.wrap},o.default.createElement("h2",{style:a.h2},this.props.title||e?r:o.default.createElement(o.default.Fragment,null,"Application error: a client-side exception has occurred (see the browser console for more information)"),"."))))}};Error.displayName="ErrorPage",Error.getInitialProps=_getInitialProps,Error.origGetInitialProps=_getInitialProps,("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)}};