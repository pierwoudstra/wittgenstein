async function readMarkdownFile(filepath) {
  try {
    const response = await fetch(filepath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const content = await response.text();
    return content;
  } catch (error) {
    console.error(`Error reading file: ${error}`);
    return null;
  }
}

function cleanText(text) {
  if (!text) {
    return "";
  }
  text = text.replace(/#+\s*/g, '');
  text = text.replace(/\*+/g, '');
  text = text.replace(/_+/g, '');
  text = text.replace(/\[.*?\]\(.*?\)/g, '');
  text = text.replace(/`.*?`/g, '');
  text = text.replace(/[^\w\s]/g, '').toLowerCase();
  return text;
}

function buildMarkovChain(words, order = 2) {
  const markovChain = {};
  if (words.length <= order) {
    return markovChain;
  }
  for (let i = 0; i < words.length - order; i++) {
    const currentState = words.slice(i, i + order).join(' ');
    const nextWord = words[i + order];
    if (!markovChain[currentState]) {
      markovChain[currentState] = [];
    }
    markovChain[currentState].push(nextWord);
  }
  return markovChain;
}

function generateText(markovChain, length = 500, seed = null) {
  if (Object.keys(markovChain).length === 0) {
    return "Cannot generate text from an empty Markov chain.";
  }

  const order = 2;

  let seedState;
  if (!seed) {
    const keys = Object.keys(markovChain);
    seedState = keys[Math.floor(Math.random() * keys.length)];
  } else if (typeof seed === 'string') {
    const seedWords = cleanText(seed).split(' ');
    if (seedWords.length >= order) {
      seedState = seedWords.slice(-order).join(' ');
    } else {
      return `Seed text needs to be at least ${order} words long for this order Markov chain.`;
    }
  } else if (Array.isArray(seed) && seed.length === order && seed.every(word => typeof word === 'string')) {
    seedState = seed.join(' ');
  } else {
    return "Invalid seed format.";
  }

  const generatedText = seedState.split(' ');
  for (let i = 0; i < length - order; i++) {
    const currentState = generatedText.slice(-order).join(' ');
    if (markovChain[currentState]) {
      const nextWord = markovChain[currentState][Math.floor(Math.random() * markovChain[currentState].length)];
      generatedText.push(nextWord);
    } else {
      break;
    }
  }
  return generatedText.join(' ');
}

async function main() {
  const filepath = 'your_book.md'; // Replace with your file path
  const markdownContent = await readMarkdownFile(filepath);

  if (markdownContent) {
    const cleanedText = cleanText(markdownContent);
    const words = cleanedText.split(' ');
    if (words.length > 2) {
      const markovModel = buildMarkovChain(words);
      const generatedOutput = generateText(markovModel, 500);
      console.log("\nGenerated Text (2nd Order):");
      console.log(generatedOutput);
      // You would then display this in your webpage
    } else {
      console.log("The book does not have enough words to build a 3rd order Markov chain effectively.");
    }
  } else {
    console.log("Could not read the Markdown file.");
  }
}

// Call the main function
main();