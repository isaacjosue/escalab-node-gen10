const { Router } = require("express");
const { nanoid } = require("nanoid");

const { ArticleService } = require("../../services");
const {
  mongo: { queries },
} = require("../../database");
const response = require("./response");

const ArticleRouter = Router();
const {
  article: {
    getAllArticles,
    removeOneArticle,
    updateOneArticle,
    getOneArticle,
  },
} = queries;

// GET /article
ArticleRouter.route("/article").get(async (req, res) => {
  try {
    const articles = await getAllArticles();

    response({ error: false, message: articles, res, status: 200 });
  } catch (error) {
    console.log(error);
    response({ message: "Internal server error", res });
  }
});

ArticleRouter.route("/article/:userId")
  // GET /article/:userId
  .get(async (req, res) => {
    const {
      params: { userId },
    } = req;

    try {
      const articleService = new ArticleService({ userId });
      const article = await articleService.getArticle();

      response({
        error: false,
        message: article,
        res,
        status: 200,
      });
    } catch (error) {
      console.log(error);
      response({ message: "Internal server error", res });
    }
  })
  // POST /article/:userId
  .post(async (req, res) => {
    const {
      params: { userId },
      body: { name, price },
    } = req;

    try {
      const articleService = new ArticleService({
        id: nanoid(),
        name,
        price,
        userId,
      });
      await articleService.saveArticle();

      response({
        error: false,
        message: await getAllArticles(),
        res,
        status: 201,
      });
    } catch (error) {
      console.log(error);
      response({ message: "Internal server error", res });
    }
  });

ArticleRouter.route("/article/:id")
  .get(async (req, res) => {
    try {
      const {
        params: { id },
      } = req;
      const article = await getOneArticle(id);

      response({ error: false, message: article, res, status: 200 });
    } catch (error) {
      console.log(error);
      response({ message: "Internal server error", res });
    }
  })
  .delete(async (req, res) => {
    try {
      const {
        params: { id },
      } = req;
      await removeOneArticle(id);

      response({
        error: false,
        message: await getAllArticles(),
        res,
        status: 200,
      });
    } catch (error) {
      console.log(error);
      response({ message: "Internal server error", res });
    }
  })
  .patch(async (req, res) => {
    const {
      body: { name, lastName, email },
      params: { id },
    } = req;

    try {
      await updateOneArticle({ id, name, lastName, email });
      response({
        error: false,
        message: await getAllArticles(),
        res,
        status: 200,
      });
    } catch (error) {
      console.log(error);
      response({ message: "Internal server error", res });
    }
  });

module.exports = ArticleRouter;
