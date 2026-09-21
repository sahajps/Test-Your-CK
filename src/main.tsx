import {render} from 'preact';import App from './App';import './styles/app.css';
render(<App/>,document.getElementById('app')!);
if('serviceWorker'in navigator&&import.meta.env.PROD)window.addEventListener('load',()=>navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`));
