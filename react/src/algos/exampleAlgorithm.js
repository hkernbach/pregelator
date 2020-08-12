const resultField = "resultField";
const dampingFactor = 0.85;

const exampleAlgo = {
  resultField: resultField,
  // TODO: Karpott.
  maxGSS: 5,
  globalAccumulators: {},
  vertexAccumulators: {
    rank: {
      accumulatorType: "sum",
      valueType: "doubles",
      storeSender: false,
    },
    tmpRank: {
      accumulatorType: "sum",
      valueType: "doubles",
      storeSender: false,
    },
  },
  phases: [
    {
      name: "main",
      initProgram: [
        "seq",
        ["error", "hallo"],
        ["accum-set!", "rank", ["/", 1, ["vertex-count"]]],
        ["accum-set!", "tmpRank", 0],
        [
          "send-to-all-neighbors",
          "tmpRank",
          ["/", ["accum-ref", "rank"], ["this-number-outbound-edges"]],
        ],
        true,
      ],
      updateProgram: [
        "seq",
        [
          "accum-set!",
          "rank",
          [
            "+",
            ["/", ["-", 1, dampingFactor], ["vertex-count"]],
            ["*", dampingFactor, ["accum-ref", "tmpRank"]],
          ],
        ],
        ["accum-set!", "tmpRank", 0],
        [
          "send-to-all-neighbors",
          "tmpRank",
          ["/", ["accum-ref", "rank"], ["this-number-outbound-edges"]],
        ],
        true,
      ],
    },
  ],
};

module.exports.exampleAlgo = exampleAlgo;
