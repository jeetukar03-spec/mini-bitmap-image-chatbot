let model = null;

const chat = document.getElementById("chat");
const btn = document.getElementById("generateBtn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

async function loadModel() {
  try {
    addMessage("Bot: Loading model...");

    // 🔥 IMPORTANT: GraphModel loader
    model = await tf.loadGraphModel("web_model/model.json");

    btn.disabled = false;
    btn.innerText = "Generate Image";

    addMessage("Bot: Model loaded successfully.");
    console.log("GraphModel ready.");
  } catch (error) {
    addMessage("Bot: Failed to load model. Check console.");
    console.error("MODEL LOAD ERROR:", error);
  }
}

function addMessage(text) {
  const div = document.createElement("div");
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function generateImage() {
  if (!model) {
    addMessage("Bot: Model not ready.");
    return;
  }

  addMessage("You: Generate image");
  addMessage("Bot: Creating image...");

  try {
    // Create noise input tensor
    const noise = tf.randomNormal([1, 100]);

    // 🔥 GraphModel uses execute()
    const prediction = model.execute(noise);

    const imageData = await prediction.data();

    drawImage(imageData);

    prediction.dispose();
    noise.dispose();

  } catch (error) {
    console.error("PREDICTION ERROR:", error);
    addMessage("Bot: Error during image generation.");
  }
}

function drawImage(data) {
  const imgData = ctx.createImageData(28, 28);

  for (let i = 0; i < data.length; i++) {
    const pixel = data[i] * 255;

    imgData.data[i * 4] = pixel;
    imgData.data[i * 4 + 1] = pixel;
    imgData.data[i * 4 + 2] = pixel;
    imgData.data[i * 4 + 3] = 255;
  }

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = 28;
  tempCanvas.height = 28;

  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.putImageData(imgData, 0, 0);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(tempCanvas, 0, 0, 280, 280);
}

btn.addEventListener("click", generateImage);

loadModel();
