const form = document.getElementById('dataForm');
const nameInput = document.getElementById('name');
const quantityInput = document.getElementById('quantity');

// CHANGE THESE
const USERNAME = "your-github-username";
const REPO = "your-repo-name";           // e.g. "data-entry"
const FILE_PATH = "data.json";           // file must already exist in repo
const TOKEN = "ghp_your_personal_access_token"; // caution: keep private

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newItem = {
    name: nameInput.value,
    quantity: quantityInput.value
  };

  const apiUrl = `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${FILE_PATH}`;

  // Get existing file content
  const getRes = await fetch(apiUrl, {
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: "application/vnd.github.v3+json"
    }
  });

  let existingData = [];
  let sha = null;

  if (getRes.ok) {
    const file = await getRes.json();
    sha = file.sha;
    const decoded = atob(file.content.replace(/\n/g, ''));
    try {
      existingData = JSON.parse(decoded);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  }

  existingData.push(newItem);

  const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(existingData, null, 2))));

  // Save new file content to GitHub
  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: "application/vnd.github.v3+json"
    },
    body: JSON.stringify({
      message: "Add new item",
      content: updatedContent,
      sha: sha
    })
  });

  if (putRes.ok) {
    alert("✅ Data saved to GitHub!");
    form.reset();
  } else {
    const err = await putRes.json();
    alert("❌ Error: " + (err.message || "Unable to save."));
    console.error(err);
  }
});
