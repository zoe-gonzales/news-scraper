# Wired.com News Scraper

## Overview
This app scrapes and displays headlines from Wired.com, allowing users to then star and comment on those articles. All data is stored in a Mongo database.

## Tools used
MongoDB, Mongoose, Cheerio, Express, Handlebars, jQuery, Bootstrap

## Getting started
Navigate to the [homepage](https://desolate-stream-48224.herokuapp.com/).

![News Scraper Main](./images/main.png)

Click **Get the news** button to view previous articles as well as retrieve new ones based on current Wired headlines. Click **Favorites** to view starred articles.

![News Scraper Articles](./images/articles.png)

Add comments. Validation is in place to prevent blank fields.

![Comment Validation](./images/validation.png)

![Comment Added](./images/commented.png)

Delete comments upon confirmation.

![Confirm Comment Delete](./images/confirm-delete.png)

Additionally, articles can be added to and removed from the favorites section.