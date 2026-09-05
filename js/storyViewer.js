/* storyViewer.js — Instagram tarzı tam ekran hikaye izleyici (sadece ana sayfada kullanılır) */
let STORY_ITEMS = [];
let STORY_INDEX = 0;
let STORY_TIMER = null;
const STORY_DURATION = 4000;

function openStoryViewer(storeName, storeAvatar, items){
  if(!items || items.length === 0) return;
  STORY_ITEMS = items;
  document.getElementById("storyStoreNameText").textContent = storeName;
  document.getElementById("storyAvatar").innerHTML = productImageTag(storeAvatar, storeName);
  document.getElementById("storyOverlay").classList.add("open");
  renderStoryProgress();
  showStory(0);
}

function renderStoryProgress(){
  const row = document.getElementById("storyProgressRow");
  row.innerHTML = STORY_ITEMS.map((_, i) => `<div class="story-seg"><div class="story-seg-fill" id="storySeg${i}"></div></div>`).join("");
}

function showStory(i){
  clearTimeout(STORY_TIMER);
  STORY_ITEMS.forEach((_, idx) => {
    const fill = document.getElementById("storySeg" + idx);
    if(!fill) return;
    fill.style.transition = "none";
    fill.style.width = idx < i ? "100%" : "0%";
  });
  STORY_INDEX = i;
  const item = STORY_ITEMS[i];
  document.getElementById("storyMedia").innerHTML = productImageTag(item.image, "hikaye");
  requestAnimationFrame(() => {
    const fill = document.getElementById("storySeg" + i);
    if(fill){ fill.style.transition = `width ${STORY_DURATION}ms linear`; fill.style.width = "100%"; }
  });
  STORY_TIMER = setTimeout(nextStory, STORY_DURATION);
}

function nextStory(){
  if(STORY_INDEX < STORY_ITEMS.length - 1) showStory(STORY_INDEX + 1);
  else closeStoryViewer();
}
function prevStory(){
  showStory(STORY_INDEX > 0 ? STORY_INDEX - 1 : 0);
}
function closeStoryViewer(){
  clearTimeout(STORY_TIMER);
  document.getElementById("storyOverlay").classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("storyOverlay");
  if(!overlay) return;
  document.getElementById("storyCloseBtn").addEventListener("click", closeStoryViewer);
  document.getElementById("storyZonePrev").addEventListener("click", prevStory);
  document.getElementById("storyZoneNext").addEventListener("click", nextStory);
  document.getElementById("storyZoneCenter").addEventListener("click", () => {
    const item = STORY_ITEMS[STORY_INDEX];
    if(item && item.link) location.href = item.link;
  });
});
