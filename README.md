# Blog Aggregator CLI Application

A command-line interface application for aggregating RSS feeds, managing your followed feeds, and Browse posts.

### Table of Contents

* [About The Project](#about-the-project)
* [Key Features](#key-features)
* [Built With](#built-with)
* [Getting Started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [Installation](#installation)
* [How to Use](#how-to-use)
* [Example](#example)
* [Roadmap](#roadmap)
* [Extending the Project](#extending-the-project)
* [Acknowledgments](#acknowledgments)

---

### About The Project

This project is a custom-built command-line blog aggregator application written in TypeScript. It allows users to manage and aggregate RSS feeds from various sources. Users can register, log in, add feeds, follow and unfollow feeds, and browse the latest posts from their followed feeds. The application is designed to be run from the command line and interacts with a PostgreSQL database to store user and feed data.

---

### Key Features

* **Interactive CLI:** Provides a user-friendly command-line interface for interacting with the application.
* **User Management:** Supports user registration and login to manage personal feed subscriptions.
* **Feed Management:** Allows users to add new RSS feeds and view a list of all available feeds.
* **Feed Following System:** Users can follow and unfollow feeds to customize their post Browse experience.
* **Post Aggregation:** Fetches and aggregates posts from various RSS feeds, allowing users to browse them in a consolidated view.
* **Database Integration:** Uses a PostgreSQL database with Drizzle ORM to persist user data, feeds, and post information.

---

### Built With

* **TypeScript**
* **Node.js**
* **PostgreSQL**
* **Drizzle ORM**
* **fast-xml-parser**

---

### Getting Started

To get a local copy up and running, follow these simple steps.

#### Prerequisites

* Node.js (LTS version recommended)
* npm or yarn
* PostgreSQL

#### Installation

1.  Clone this repository:
    ```sh
    git clone [https://github.com/Sanghun1Adam1Park/blog-aggregator-ts](https://github.com/Sanghun1Adam1Park/blog-aggregator-ts)
    ```
2.  Navigate to the project directory:
    ```sh
    cd blog-aggregator-ts
    ```
3.  Install dependencies:
    ```sh
    npm install
    ```
4.  Set up your PostgreSQL database and update the connection string in `drizzle.config.ts`.
5.  Run database migrations:
    ```sh
    npx drizzle-kit migrate
    ```

---

### How to Use

The application can be run by executing the main script with `tsx`.

From the project root, start the Blog Aggregator CLI with a command:
```sh
npm start <command> [args...]
# or
```
The application will execute the command and display the output.

---

### Example

Here are some example commands you can use in the Blog Aggregator CLI:
- Register a new user:
```
npm start register myusername
```

- Log in as a user:
```
npm start login myusername
```

- Add a new feed:
```
npm start addfeed "Example Blog" "[https://example.com/rss](https://example.com/rss)"
```

- Follow a feed:
```
npm start follow "[https://example.com/rss](https://example.com/rss)"
```

- View followed feeds:
```
npm start following
```

- Browse n posts from followed feeds:
```
npm start browse n
or
npm start browse # shows 2 posts by default
```

- Unfollow a feed:
```
npm start unfollow "[https://example.com/rss](https://example.com/rss)"
```

- Start the aggregator to fetch new posts:
```
npm start agg 5m # every five minutes 
```

---

### Roadmap
* Add sorting and filtering options to the browse command.
* Add pagination to the browse command.
* Add concurrency to the agg command so that it can fetch more frequently.
* Add a search command that allows for fuzzy searching of posts.
* Add bookmarking or liking posts.
* Add a TUI that allows you to select a post in the terminal and view it in a more readable format (either in the terminal or open in a browser).
* Add an HTTP API (and authentication/authorization) that allows other users to interact with the service remotely.
* Write a service manager that keeps the agg command running in the background and restarts it if it crashes.

---

### Acknowledgments

* Boot.dev - Backend dev Tutorial
* Drizzle ORM - For the amazing TypeScript ORM
* Mozilla Developer Network - For their invaluable web documentation