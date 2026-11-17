
const skillQuizzes = {
    javascript: [
        { question: "Which keyword declares a block-scoped variable?", options: ["var", "let", "define", "dim"], answer: 1 },
        { question: "Which method converts JSON text into a JavaScript object?", options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.object()"], answer: 1 },
        { question: "What does === check?", options: ["Value only", "Type only", "Value and type", "Variable name"], answer: 2 },
        { question: "Which array method creates a new array by transforming elements?", options: ["forEach()", "map()", "push()", "pop()"], answer: 1 },
        { question: "Which keyword handles an asynchronous function?", options: ["wait", "async", "defer", "promise"], answer: 1 }
    ],

    python: [
        { question: "Which symbol starts a comment in Python?", options: ["//", "#", "/*", "--"], answer: 1 },
        { question: "Which data type stores key-value pairs?", options: ["List", "Tuple", "Dictionary", "Set"], answer: 2 },
        { question: "What does len() return?", options: ["Data type", "Number of items", "Memory address", "Last item"], answer: 1 },
        { question: "Which keyword defines a function?", options: ["function", "fun", "def", "define"], answer: 2 },
        { question: "Which collection does not allow duplicate values?", options: ["List", "Tuple", "Set", "String"], answer: 2 }
    ],

    html: [
        { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyperlinks Text Management Language", "Home Tool Markup Language"], answer: 0 },
        { question: "Which tag creates a hyperlink?", options: ["<link>", "<a>", "<href>", "<url>"], answer: 1 },
        { question: "Which tag represents the largest heading?", options: ["<h6>", "<head>", "<h1>", "<heading>"], answer: 2 },
        { question: "Which attribute provides alternative text for an image?", options: ["title", "src", "alt", "name"], answer: 2 },
        { question: "Which HTML element is used to create a form?", options: ["<input>", "<form>", "<fieldset>", "<label>"], answer: 1 }
    ],

    css: [
        { question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style System", "Colorful Style Sheets"], answer: 1 },
        { question: "Which property changes text color?", options: ["font-color", "text-color", "color", "background"], answer: 2 },
        { question: "Which selector targets an element by its ID?", options: [".", "#", "*", "&"], answer: 1 },
        { question: "Which property controls space inside an element's border?", options: ["margin", "padding", "spacing", "outline"], answer: 1 },
        { question: "Which CSS layout system is designed for one-dimensional layouts?", options: ["Grid", "Float", "Flexbox", "Position"], answer: 2 }
    ],

    react: [
        { question: "What is React primarily used for?", options: ["Database management", "Building user interfaces", "Server hosting", "Operating systems"], answer: 1 },
        { question: "Which syntax is commonly used to describe UI in React?", options: ["JSX", "SQL", "XML Schema", "Markdown"], answer: 0 },
        { question: "Which hook manages state in a functional component?", options: ["useEffect", "useState", "useRef", "useMemo"], answer: 1 },
        { question: "What property helps React identify list items?", options: ["id", "key", "index", "ref"], answer: 1 },
        { question: "How is data commonly passed from a parent component to a child?", options: ["Props", "State only", "CSS", "Events only"], answer: 0 }
    ],

    "node.js": [
        { question: "What is Node.js?", options: ["A database", "A JavaScript runtime", "A CSS framework", "A web browser"], answer: 1 },
        { question: "Which command initializes a Node.js project?", options: ["node start", "npm init", "node create", "npm run"], answer: 1 },
        { question: "Which module is used to create an HTTP server?", options: ["http", "fs", "path", "events"], answer: 0 },
        { question: "Which object provides access to environment variables?", options: ["process.env", "window.env", "global.env", "server.env"], answer: 0 },
        { question: "What does npm stand for?", options: ["Node Project Manager", "Node Package Manager", "New Programming Module", "Network Package Method"], answer: 1 }
    ],

    java: [
        { question: "Which keyword is used to create a class in Java?", options: ["function", "class", "struct", "define"], answer: 1 },
        { question: "Which method is the usual entry point of a Java application?", options: ["start()", "run()", "main()", "init()"], answer: 2 },
        { question: "Which keyword creates an object in Java?", options: ["create", "new", "object", "this"], answer: 1 },
        { question: "Which type stores true or false values?", options: ["int", "String", "boolean", "char"], answer: 2 },
        { question: "Which keyword is used for inheritance between classes?", options: ["implements", "extends", "inherits", "super"], answer: 1 }
    ],

    "c++": [
        { question: "Which symbol ends most C++ statements?", options: [":", ";", ".", ","], answer: 1 },
        { question: "Which header provides cout and cin?", options: ["<stdio.h>", "<iostream>", "<string>", "<math.h>"], answer: 1 },
        { question: "Which operator accesses a member through an object?", options: ["->", ".", "::", "&"], answer: 1 },
        { question: "Which keyword is used to define a class?", options: ["object", "struct", "class", "define"], answer: 2 },
        { question: "Which feature allows functions to have the same name with different parameters?", options: ["Inheritance", "Function overloading", "Encapsulation", "Recursion"], answer: 1 }
    ],

    mongodb: [
        { question: "What type of database is MongoDB?", options: ["Relational", "Document-oriented NoSQL", "Graph only", "Hierarchical"], answer: 1 },
        { question: "Which format is commonly used to represent MongoDB documents?", options: ["CSV", "BSON", "HTML", "XML only"], answer: 1 },
        { question: "Which method inserts one document into a collection?", options: ["insertOne()", "addRow()", "createTable()", "pushOne()"], answer: 0 },
        { question: "Which method retrieves documents from a collection?", options: ["find()", "selectTable()", "getRows()", "readAll()"], answer: 0 },
        { question: "What is a collection in MongoDB?", options: ["A group of databases", "A group of documents", "A single field", "A database password"], answer: 1 }
    ],

    sql: [
        { question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Question Language", "System Query Logic", "Sequential Query List"], answer: 0 },
        { question: "Which command retrieves data from a table?", options: ["GET", "SELECT", "FETCH TABLE", "READ"], answer: 1 },
        { question: "Which clause filters records?", options: ["ORDER BY", "GROUP BY", "WHERE", "JOIN"], answer: 2 },
        { question: "Which command adds a new record?", options: ["INSERT INTO", "UPDATE", "ALTER", "SELECT"], answer: 0 },
        { question: "Which key uniquely identifies each row in a table?", options: ["Foreign key", "Primary key", "Default key", "Duplicate key"], answer: 1 }
    ],

    figma: [
        { question: "What is Figma mainly used for?", options: ["Video editing", "Interface design and prototyping", "Database management", "Programming"], answer: 1 },
        { question: "What is a Figma Frame commonly used for?", options: ["Organizing a screen or design area", "Writing server code", "Storing passwords", "Compressing images"], answer: 0 },
        { question: "What does Auto Layout help with?", options: ["Automatic responsive arrangement of elements", "Audio editing", "Database queries", "Changing file formats"], answer: 0 },
        { question: "What is a component in Figma?", options: ["A reusable design element", "A font file", "A browser extension", "A code compiler"], answer: 0 },
        { question: "What is prototyping used for?", options: ["Testing interactive design flows", "Creating databases", "Writing CSS only", "Editing audio"], answer: 0 }
    ],

    photoshop: [
        { question: "What is Adobe Photoshop mainly used for?", options: ["Image editing", "Database design", "Web hosting", "Audio recording"], answer: 0 },
        { question: "Which tool is commonly used to select a rectangular area?", options: ["Brush Tool", "Rectangular Marquee Tool", "Eraser Tool", "Pen Tool"], answer: 1 },
        { question: "What is the purpose of layers?", options: ["Separate and organize image elements", "Increase internet speed", "Create databases", "Install fonts"], answer: 0 },
        { question: "Which file format supports Photoshop layers?", options: ["PSD", "TXT", "MP3", "CSV"], answer: 0 },
        { question: "What does the Crop Tool do?", options: ["Remove unwanted outer areas of an image", "Change sound", "Create tables", "Write text code"], answer: 0 }
    ],

    illustrator: [
        { question: "What is Adobe Illustrator primarily used for?", options: ["Vector graphics", "Video streaming", "Database management", "Audio mixing"], answer: 0 },
        { question: "Which tool is commonly used to draw freeform paths?", options: ["Pen Tool", "Crop Tool", "Eraser Tool", "Zoom Tool"], answer: 0 },
        { question: "What is a vector graphic?", options: ["An image based on mathematical paths", "An image made only of pixels", "A sound file", "A spreadsheet"], answer: 0 },
        { question: "Which file format is native to Illustrator?", options: ["AI", "PSD", "DOCX", "MP4"], answer: 0 },
        { question: "What does the Shape Builder Tool help create?", options: ["Combined or separated shapes", "Audio tracks", "Database tables", "Text documents"], answer: 0 }
    ],

    "ui design": [
        { question: "What does UI stand for?", options: ["User Interface", "Universal Internet", "User Information", "Unified Input"], answer: 0 },
        { question: "What is the main goal of UI design?", options: ["Create clear and usable interfaces", "Manage databases", "Write server scripts", "Improve network speed"], answer: 0 },
        { question: "Which choice improves text readability?", options: ["Very low contrast", "Clear typography and sufficient contrast", "Using many fonts together", "Making all text tiny"], answer: 1 },
        { question: "What is a design system?", options: ["A collection of reusable design rules and components", "A computer operating system", "A database server", "A programming language"], answer: 0 },
        { question: "What does visual hierarchy help users understand?", options: ["Which elements are most important", "How a server works", "How to write SQL", "How to compress files"], answer: 0 }
    ],

    "ux design": [
        { question: "What does UX stand for?", options: ["User Experience", "Universal Extension", "User XML", "Unified Example"], answer: 0 },
        { question: "What is the main focus of UX design?", options: ["The overall user experience", "Only color selection", "Only programming syntax", "Database storage"], answer: 0 },
        { question: "Why are user interviews conducted?", options: ["To understand user needs and problems", "To write code automatically", "To increase image size", "To test internet speed"], answer: 0 },
        { question: "What is a user persona?", options: ["A research-based representation of a target user", "A programming variable", "A database table", "A color palette"], answer: 0 },
        { question: "What is usability testing?", options: ["Observing users as they complete tasks", "Checking only the source code", "Testing server hardware", "Measuring image resolution"], answer: 0 }
    ],

    canva: [
        { question: "What is Canva mainly used for?", options: ["Graphic design and visual content creation", "Database programming", "Operating systems", "Network configuration"], answer: 0 },
        { question: "Which Canva feature helps maintain consistent branding?", options: ["Brand Kit", "Code Editor", "Terminal", "Database View"], answer: 0 },
        { question: "Which format is commonly used for transparent images?", options: ["PNG", "TXT", "MP3", "CSV"], answer: 0 },
        { question: "What is a Canva template?", options: ["A pre-designed layout that can be customized", "A programming compiler", "A database query", "An audio file"], answer: 0 },
        { question: "Which design principle helps align elements neatly?", options: ["Alignment", "Random placement", "Distortion", "Duplication"], answer: 0 }
    ],

    marketing: [
        { question: "What is the main purpose of marketing?", options: ["Understand and satisfy customer needs", "Only increase product prices", "Manage computer hardware", "Write software code"], answer: 0 },
        { question: "What are the traditional 4 Ps of marketing?", options: ["Product, Price, Place, Promotion", "People, Plan, Process, Program", "Product, People, Profit, Power", "Price, Profit, Plan, Performance"], answer: 0 },
        { question: "What is a target audience?", options: ["The specific group a campaign aims to reach", "All company employees", "Only competitors", "A group of suppliers"], answer: 0 },
        { question: "What does SEO stand for?", options: ["Search Engine Optimization", "Social Email Operation", "Sales Entry Output", "Search Editing Option"], answer: 0 },
        { question: "What is a marketing conversion?", options: ["A desired action completed by a user", "Changing a file format", "Deleting an advertisement", "Creating a password"], answer: 0 }
    ],

    accounting: [
        { question: "What is the basic accounting equation?", options: ["Assets = Liabilities + Equity", "Assets = Revenue - Expenses", "Profit = Assets + Liabilities", "Equity = Expenses + Revenue"], answer: 0 },
        { question: "Which statement shows assets, liabilities, and equity?", options: ["Balance Sheet", "Income Statement", "Cash Receipt", "Sales Invoice"], answer: 0 },
        { question: "What is a debit in double-entry accounting?", options: ["An entry on the left side of an account", "Always an increase in revenue", "An entry only for liabilities", "A bank password"], answer: 0 },
        { question: "What is depreciation?", options: ["Allocation of an asset's cost over its useful life", "An increase in sales", "Payment of dividends", "Recording customer feedback"], answer: 0 },
        { question: "What does a trial balance help check?", options: ["Whether total debits equal total credits", "Whether all customers are satisfied", "Whether prices are competitive", "Whether employees are present"], answer: 0 }
    ],

    finance: [
        { question: "What is a budget?", options: ["A plan for expected income and expenses", "A list of employees", "A marketing slogan", "A computer program"], answer: 0 },
        { question: "What is compound interest?", options: ["Interest earned on principal and accumulated interest", "Interest calculated only on the original principal", "A fixed bank fee", "A type of tax"], answer: 0 },
        { question: "What does ROI stand for?", options: ["Return on Investment", "Rate of Income", "Record of Interest", "Revenue of Insurance"], answer: 0 },
        { question: "What is liquidity?", options: ["How easily an asset can be converted into cash", "The total number of employees", "A company's brand value", "The age of equipment"], answer: 0 },
        { question: "What is diversification in investing?", options: ["Spreading investments across different assets", "Investing everything in one asset", "Avoiding all financial records", "Borrowing without a plan"], answer: 0 }
    ],

    entrepreneurship: [
        { question: "Who is an entrepreneur?", options: ["A person who starts and manages a business venture", "Only a government employee", "A person who avoids all risks", "A person who only buys products"], answer: 0 },
        { question: "What is a business plan?", options: ["A document describing business goals and strategies", "A list of customer passwords", "A product advertisement only", "A tax receipt"], answer: 0 },
        { question: "What is a startup?", options: ["A newly established business", "An old accounting record", "A finished product only", "A government department"], answer: 0 },
        { question: "What is market research used for?", options: ["Understanding customers and competitors", "Designing computer hardware", "Writing programming syntax", "Calculating employee attendance"], answer: 0 },
        { question: "What is a value proposition?", options: ["The benefit a product offers to customers", "The total number of workers", "A company's office address", "A list of expenses only"], answer: 0 }
    ],

    english: [
        { question: "Which word is a noun?", options: ["Quickly", "Beautiful", "Teacher", "Run"], answer: 2 },
        { question: "Choose the correct sentence.", options: ["She go to school.", "She goes to school.", "She going school.", "She gone to school."], answer: 1 },
        { question: "What is the past tense of 'write'?", options: ["Writed", "Written", "Wrote", "Writing"], answer: 2 },
        { question: "Which word is a synonym of 'happy'?", options: ["Joyful", "Angry", "Tired", "Afraid"], answer: 0 },
        { question: "Which article is correct before 'apple'?", options: ["A", "An", "The only", "No article ever"], answer: 1 }
    ],

    bangla: [
        { question: "বাংলা বর্ণমালায় স্বরবর্ণ কয়টি?", options: ["১০টি", "১১টি", "১২টি", "১৩টি"], answer: 1 },
        { question: "‘বিদ্যালয়’ শব্দের অর্থ কী?", options: ["বাজার", "শিক্ষালয়", "হাসপাতাল", "খেলার মাঠ"], answer: 1 },
        { question: "‘সুন্দর’ শব্দের বিপরীত শব্দ কোনটি?", options: ["মনোরম", "কুৎসিত", "চমৎকার", "সুশ্রী"], answer: 1 },
        { question: "‘আমি ভাত খাই’ বাক্যে ক্রিয়া কোনটি?", options: ["আমি", "ভাত", "খাই", "কোনোটিই নয়"], answer: 2 },
        { question: "বাংলা ভাষার প্রধান দুটি রূপ কী?", options: ["সাধু ও চলিত", "দেশি ও বিদেশি", "লিখিত ও মৌখিক", "ছোট ও বড়"], answer: 0 }
    ],

    arabic: [
        { question: "How is Arabic written?", options: ["Left to right", "Right to left", "Top to bottom", "In circles"], answer: 1 },
        { question: "How many letters are in the standard Arabic alphabet?", options: ["24", "26", "28", "30"], answer: 2 },
        { question: "What does 'مرحبا' commonly mean?", options: ["Goodbye", "Hello", "Thank you", "Please"], answer: 1 },
        { question: "What does 'شكرا' mean?", options: ["Thank you", "Good morning", "Welcome", "Sorry"], answer: 0 },
        { question: "Which of these is an Arabic question word meaning 'what'?", options: ["من", "أين", "ماذا", "متى"], answer: 2 }
    ],

    japanese: [
        { question: "Which writing system is commonly used for native Japanese words and grammatical endings?", options: ["Hiragana", "Arabic", "Cyrillic", "Greek"], answer: 0 },
        { question: "What does 'こんにちは' mean?", options: ["Good night", "Hello / Good afternoon", "Thank you", "Goodbye"], answer: 1 },
        { question: "How do you say 'thank you' in Japanese?", options: ["さようなら", "ありがとう", "おはよう", "すみません"], answer: 1 },
        { question: "Which Japanese writing system is commonly used for foreign loanwords?", options: ["Katakana", "Hiragana only", "Kanji only", "Latin only"], answer: 0 },
        { question: "What does 'はい' mean?", options: ["No", "Yes", "Goodbye", "Please"], answer: 1 }
    ],

    cooking: [
        { question: "What is the purpose of preheating an oven?", options: ["Reach the required temperature before cooking", "Cool the food", "Clean the oven", "Increase food weight"], answer: 0 },
        { question: "Which method cooks food using hot water or steam?", options: ["Grilling", "Boiling", "Frying", "Roasting"], answer: 1 },
        { question: "Why should raw meat be kept separate from ready-to-eat food?", options: ["To prevent cross-contamination", "To improve color", "To increase sweetness", "To reduce cooking time"], answer: 0 },
        { question: "What does sautéing generally involve?", options: ["Cooking quickly in a small amount of fat", "Cooking underwater for hours", "Freezing food", "Cooking only with steam"], answer: 0 },
        { question: "What is mise en place?", options: ["Preparing and organizing ingredients before cooking", "Serving food cold", "Cleaning dishes after eating", "A type of oven"], answer: 0 }
    ],

    baking: [
        { question: "What is the main purpose of baking powder?", options: ["Act as a leavening agent", "Add saltiness", "Color the dough", "Prevent all browning"], answer: 0 },
        { question: "Which ingredient provides structure in many cakes?", options: ["Flour", "Food coloring", "Vanilla essence", "Water only"], answer: 0 },
        { question: "Why should ingredients often be measured accurately in baking?", options: ["Baking depends on precise proportions", "It changes the oven size", "It removes the need for heat", "It prevents all mistakes"], answer: 0 },
        { question: "What does kneading develop in bread dough?", options: ["Gluten structure", "Sugar crystals", "Food coloring", "Ice crystals"], answer: 0 },
        { question: "What is proofing in bread making?", options: ["Allowing dough to rise", "Freezing the dough", "Removing all moisture", "Cutting the bread"], answer: 0 }
    ],

    dessert: [
        { question: "What is the main ingredient in traditional custard?", options: ["Eggs", "Rice", "Potatoes", "Lentils"], answer: 0 },
        { question: "What does chilling help do when making many no-bake desserts?", options: ["Set and firm the mixture", "Boil the mixture", "Increase its temperature", "Remove all flavor"], answer: 0 },
        { question: "Which ingredient is commonly used to thicken pudding?", options: ["Cornstarch", "Vinegar", "Cooking oil", "Black pepper"], answer: 0 },
        { question: "What is caramel mainly made by heating?", options: ["Sugar", "Flour", "Salt", "Butter only"], answer: 0 },
        { question: "What does folding mean in dessert preparation?", options: ["Gently combining mixtures while retaining air", "Boiling ingredients rapidly", "Cutting ingredients into cubes", "Freezing a mixture"], answer: 0 }
    ],

    bbq: [
        { question: "What does BBQ commonly involve?", options: ["Cooking with direct or indirect heat, often over smoke", "Only boiling food", "Only steaming vegetables", "Freezing meat"], answer: 0 },
        { question: "Why should a grill be preheated?", options: ["To prepare the cooking surface", "To freeze the food", "To remove all seasoning", "To stop heat transfer"], answer: 0 },
        { question: "What is a marinade used for?", options: ["Adding flavor and sometimes tenderizing food", "Freezing food instantly", "Removing all moisture", "Replacing cooking heat"], answer: 0 },
        { question: "What is indirect grilling?", options: ["Cooking food away from the main heat source", "Placing food directly over flames", "Cooking without any heat", "Boiling food in water"], answer: 0 },
        { question: "Why should separate utensils be used for raw and cooked meat?", options: ["To reduce cross-contamination", "To change the cooking temperature", "To make meat sweeter", "To increase smoke"], answer: 0 }
    ]
};

module.exports = skillQuizzes;
