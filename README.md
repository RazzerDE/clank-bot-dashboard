<h1 align="center">
     🛠️ Clank-Dashboard ~ Creative dashboard for discord-bots
</h1>

<p align="center">
  <i align="center">This dashboard allows you to configure & customize my own Discord bot "Clank" without needing to use Discord directly. <br />It doesn't include the backend functionalities.</i>
  <br /><br />

  <img src="https://i.imgur.com/pWnBahr.gif" align="center">

</p>

<h4 align="center">
  <a href="https://angular.dev">
    <img src="https://img.shields.io/badge/Angular-17.3.11-27ae60?style=for-the-badge" alt="angular version" style="height: 25px;">
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind-3.4.17-27ae60?style=for-the-badge" alt="tailwind version" style="height: 25px;">
  </a>
   <a href="https://discord.gg/bl4cklist">
    <img src="https://img.shields.io/discord/616655040614236160?style=for-the-badge&logo=discord&label=Discord&color=%237289da" alt="discord server" style="height: 25px;">
  </a>
  <a href="https://animate.style">
    <img src="https://img.shields.io/badge/Animate.css-4.1.1-27ae60?style=for-the-badge" alt="animate.css version" style="height: 25px;">
  </a>
  <a href="https://jestjs.io/">
    <img src="https://img.shields.io/badge/JEST-29.7.0-27ae60?style=for-the-badge" alt="jest version" style="height: 25px;">
  </a>
  <br>
</h4>

## 🗯️ Introduction
› This project provides the frontend for the dashboard of my own public Discord bot "Clank" and is also actively used to configure modules and general settings of it. I hope that maybe some people can learn something from it when they look at the project.

💝 › The project was developed by Yannic Drews and is actively maintained - user requests are welcome and are actively discussed together with a small Discord server team. :)

## 🪛 What can i learn?
› `Clank Dashboard` offers some fundamental features that help you better understand or apply basic concepts in certain areas.
<br />

📢 › This project uses a handful third-party libraries: `Tailwind`, `Bootstrap`, `JEST` and `Bootstrap`.

It supports following <strong>features</strong>:
<ul> 
  <li>🖼️ <strong>Creative & beautiful design</strong>: We have put a lot of thought into the design of the website and wanted it to be something unique - we have put a lot of love and attention to detail into it.</li>
  <br /> 
  <li>💚 <strong>100% Unit-Test Coverage</strong>: Software testing is an important point when programming professionally for clients - we have tested all our TypeScript code, and you may be able to learn something from it.</li> 
  <br /> 
  <li>🚩 <strong>Language Switcher</strong>: Our website automatically detects the language of your browser and displays English/German accordingly, alternatively the user can switch via button click.</li> 
  <br /> 
  <li>📱 <strong>Responsive for all Devices</strong>: We have put a special focus on ensuring that the website is beautifully and user-friendly displayed on as many devices as possible.</li> 
  <br /> 
  <li>👥 <strong>Discord-Login</strong>: To log in to the dashboard, the respective user must authenticate with Discord.</li>
  <br /> 
  <li>🎈 <strong>Catchy Animations</strong>: As soon as an object comes into the user's field of view, a beautiful animation is played if applicable.</li> 
  <br /> 
  <li>🔺 <strong>Work with API-Data</strong>: Here you can see how API data from a REST server could be processed.</li>
  <br /> 
  <li>🔍 <strong>Search function</strong>: Users can search for specific functions or pages in the bot's dashboard if they are logged in.</li> 
  <br /> 
  <li>⏳ <strong>Page-Loader</strong>: While the website is being built and all data is loading, a nice animated icon is displayed, which was built entirely with CSS.</li> 
</ul>

⚙️ › To run the <strong>test coverage</strong> and see the results, just open a terminal in the project root folder and run the command `jest`.

## 🔨 Installation
› Before you can start exploring our small website for learning purposes, there are a few preparations you need to make.

💡 › You will need a <strong>own Backend RESTful-Service</strong> in order to test the API functionality.<br />

Follow these steps to ensure everything runs smoothly:
1. Clone the project and navigate with a terminal to the project root folder.
2. Set up the configuration in `src/environments/config.ts` to your needs.
4. Run `npm install` to install all dependencies.
5. Run `ng build` to build the project.
6. Upload the content of the `dist/` folder to your webserver.
7. visit the page of your webserver - HAVE FUN!

🪛 › <strong>I don't have a webserver:</strong> Thats not a problem! Just use `ng serve` instead of `ng build` and open the page `localhost:4200` in your web browser.

## ❓ Configuration Example
› You need to create the configuration file `src/environments/config.ts` in order to let the discord login & api calls work.

An example of the configuration could look like this:
```ts
export const config = {
  domain: 'http://localhost:4200',
  api_url: 'http://localhost:8081',  // used for general api calls
  discord_url: 'https://discord.com/api/v10',  // used for the discord oauth2
  redirect_url: 'http://localhost:4200/dashboard',  // used for the discord oauth2
  client_id: 'YOUR_DISCORD_CLIENT_ID'  // used for the discord oauth2
}
```
