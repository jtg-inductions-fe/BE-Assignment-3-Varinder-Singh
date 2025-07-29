# Data Driven Marketplace Lite

Demand-Driven Marketplace for household item (pre-owned/new/refurbished everything). Buyer will post their requirement with a budget, and sellers can bid to fulfilling that requirement.

### Prerequisites

- **Node.js**: Version 20+. You can download and install it from nodejs.org.
- **yarn**: Version 4.5.0. If Yarn is not installed, you can follow the instruction below in Installing section

### Installing

To set up the project on your local environment, follow these steps:

1. **Clone the Repository**

    First, you need to clone the repository.

2. **Install the necessary dependencies using yarn**

    ```bash
    yarn
    ```

    > **_NOTE_** : It is recommended to update all packages to their latest versions by running `yarn upgrade --latest`. If the updated packages introduce breaking changes, you may need to adjust the base template accordingly.

3. **Create .env file**

Create .env file at root of project, provide required variables listed in .env.template

3. **Run the Development Server**

    ```bash
    yarn start:dev
    ```

    The app will typically be available at http://localhost:3000, but check the terminal output for the exact URL.

    > **_NOTE:_** : If you want to change the server's port number, you can do so by modifying **.env file** at the root level of the project and update the PORT field (check **.env.template** for reference)

    ```env
    PORT=<New Port>
    ```

4. **Format the Code**

    ```bash
    yarn format
    ```

5. **Lint the Code**

    ```bash
    yarn lint
    ```

6. **To Fix Lint errors**

    ```bash
    yarn lint --fix
    ```
