Texd Installation Guide
=================

Note: All commands entered need to be performed from within *this directory*.

1. Ensure you have a clean directory to dedicate as to a database (e.g. `C:\database` or `~/database/`).

2. From *this repository's directory*, run the following command to launch the MongoDB process.
    ```shell
    <MONGO_INSTALL_DIRECTORY>/bin/mongod --dbpath <PATH_TO_DB_DIRECTORY>
    ```
    
3. Install TypeScript globally: 
    ```shell
    sudo npm install -g typescript
    ```
    
4. From this directory, install the app's node dependencies, tsd, and typings with the following commands:
    ```shell
    npm install
    npm install -g tsd
    tsd install
    ```

5. Before compiling the app you may have to change permissions (default is 744 after tsd install) to the typings directory.
    ```shell
    chmod -R 774 typings
    ```

6. Compile the app with the following command:
    ```shell
    tsc
    ```

7. Launch the Node process to serve the app using the following command from the root folder:
    ```shell
    node server
    ```

8. Open Google Chrome or Mozilla Firefox and navigate to `http://localhost:3000/` to access the app.

### Alternatively - you can use [docker](https://github.com/zalox/docker-images/tree/master/Texd)
