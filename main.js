'use strict';

// includes
const db = require('@arangodb').db;
const pregel = require("@arangodb/pregel");
let sgm = require("@arangodb/smart-graph");
const joi = require('joi');

// router
const createRouter = require('@arangodb/foxx/router');
const router = createRouter();
module.context.use(router);

// example algo
const exampleAlgo = require('./algos/exampleAlgorithm').exampleAlgo;

router.post('/start', function (req, res) {
  const name = req.body.name || "name";
  const graphName = req.body.graphName;
  const algorithm = req.body.algorithm;
  let pid = pregel.start(
    "air",
    graphName,
    algorithm
  );
  res.send({
    pid: pid
  });
})
  .body(
    joi.object().required(),
    'This implies JSON.'
  )
  .response(['application/json'], 'A generic greeting.')
  .summary('Generic greeting')
  .description('Prints a generic greeting.');

router.post('/resultDetails', function (req, res) {
  const graphName = req.body.graphName || "";
  const resultField = req.body.resultField || "";

  let finalResult = {};

  // get all vertex collections
  let vertexColls = sgm._graph(graphName)._vertexCollections();
  for (let [key, col] of Object.entries(vertexColls)) {
    let collectionName = col.name();
    finalResult[collectionName] = [];

    let res = db._query(
      'FOR doc IN @@vertexCollection LIMIT 5 RETURN doc[@resultField]',
      {
        '@vertexCollection': collectionName,
        'resultField': resultField
      }
    ).toArray();
    finalResult[collectionName].push(res);
  }
  ;

  res.send(finalResult);
})
  .body(
    joi.object().required(),
    'This implies JSON.'
  )
  .response(['application/json'], 'A generic greeting.')
  .summary('Generic greeting')
  .description('Prints a generic greeting.');

router.post('/status', function (req, res) {
  const pid = req.body.pid || "";
  let result = pregel.status(pid);
  res.send(result);
})
  .body(
    joi.object().required(),
    'This implies JSON.'
  )
  .response(['application/json'], 'A generic greeting.')
  .summary('Generic greeting')
  .description('Prints a generic greeting.');

router.get('/graphs', function (req, res) {
  res.send(sgm._list());
})
  .response(['application/json'], 'A generic greeting.')
  .summary('Generic greeting')
  .description('Prints a generic greeting.');

router.get('/userDefinedAlgorithms', function (req, res) {
  const qualifiedName = module.context.collectionName("userDefinedAlgorithms");
  let arr = db[qualifiedName].all().toArray();
  let result = {};
  arr.forEach(document => {
    result[document._key] = document;
  });

  // also push demo example
  result["dev_DemoPageRank"] = exampleAlgo;

  res.send(result);
})
  .response(['application/json'], 'A generic greeting.')
  .summary('Generic greeting')
  .description('Prints a generic greeting.');