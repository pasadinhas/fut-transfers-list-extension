const meta = document.createElement('meta');
meta.name = "fut-transfers-list-extension-id";
meta.content = chrome.runtime.id;
document.getElementsByTagName('head')[0].appendChild(meta);