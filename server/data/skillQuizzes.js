
const skillQuizzes = {
    javascript: [
        {
            question: "Which keyword declares a block-scoped variable?",
            options: ["var", "let", "define", "dim"],
            answer: 1
        },
        {
            question: "Which method converts JSON text into a JavaScript object?",
            options: [
                "JSON.stringify()",
                "JSON.parse()",
                "JSON.convert()",
                "JSON.object()"
            ],
            answer: 1
        },
        {
            question: "What does === check?",
            options: [
                "Value only",
                "Type only",
                "Value and type",
                "Variable name"
            ],
            answer: 2
        },
        {
            question: "Which array method creates a new array by transforming elements?",
            options: ["forEach()", "map()", "push()", "pop()"],
            answer: 1
        },
        {
            question: "Which keyword handles an asynchronous function?",
            options: ["wait", "async", "defer", "promise"],
            answer: 1
        }
    ],

    python: [
        {
            question: "Which symbol starts a comment in Python?",
            options: ["//", "#", "/*", "--"],
            answer: 1
        },
        {
            question: "Which data type stores key-value pairs?",
            options: ["List", "Tuple", "Dictionary", "Set"],
            answer: 2
        },
        {
            question: "What does len() return?",
            options: [
                "Data type",
                "Number of items",
                "Memory address",
                "Last item"
            ],
            answer: 1
        },
        {
            question: "Which keyword defines a function?",
            options: ["function", "fun", "def", "define"],
            answer: 2
        },
        {
            question: "Which collection does not allow duplicate values?",
            options: ["List", "Tuple", "Set", "String"],
            answer: 2
        }
    ]
};

module.exports = skillQuizzes;
