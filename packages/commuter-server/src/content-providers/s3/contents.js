// @flow

import type { $Request, $Response } from "express";

const express = require("express");

const {
  listObjects,
  getObject,
  deleteObject,
  deleteObjects,
  uploadObject
} = require("./s3");

// TODO: typing here reflects what was put in place before, this could be
// more strict while letting flow do the work vs. the testing of common functions
const isDir = (path?: string | null) => !path || (path && path.endsWith("/"));

const errObject = (err, path) => ({
  message: `${err.message}: ${path}`,
  reason: err.code
});

function createRouter(): express.Router {
  const router = express.Router();

  router.get("/*", (req: $Request, res: $Response) => {
    const path = req.params["0"];
    const cb = (err, data) => {
      if (err) res.status(500).json(errObject(err, path));
      else res.json(data);
    };
    if (isDir(path)) listObjects(path, cb);
    else getObject(path, cb);
  });

  router.delete("/*", (req: $Request, res: $Response) => {
    const path = req.params["0"];
    const cb = (err, data) => {
      if (err) res.status(500).json(errObject(err, path));
      else res.status(204).send(); //as per jupyter contents api
    };
    if (isDir(path)) deleteObjects(path, cb);
    else deleteObject(path, cb);
  });

  router.post("/*", (req: $Request, res: $Response) => {
    const path = req.params["0"];
    const cb = (err, data) => {
      if (err) res.status(500).json(errObject(err, path));
      else res.status(201).send();
    };
    uploadObject(path, req.body, cb);
  });

  return router;
}

module.exports = {
  createRouter,
  isDir
};