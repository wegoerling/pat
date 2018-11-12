Install node LTS version.
Install Visual Studio Code
Clone repository 'https://github.com/jamesmontalvo3/spacewalk.git'
In visual studio code, open folder to view source code and other documentation in the repo.

After project is opened in VS Code, in the console, run npm install. This will install all dependancies that are required.

After npm install the package, navigate to ./src and run node index.js -i 'yml file to parse otherwise nothing'. This should compile and run the javascript file index.js and log the parsed data in JSON format.