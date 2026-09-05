/* storyViewer.js — Instagram tarzı tam ekran hikaye izleyici (sadece ana sayfada kullanılır).
   Birden fazla mağazanın hikayelerini art arda gösterebilir: bir mağazanın
   hikayeleri bitince otomatik olarak sıradaki mağazanın hikayesine geçer. */
let STORY_GROUPS = [];   // [{ storeName, storeAvatar, items:[{image,link}] }, ...]
let STORY_GROUP_INDEX = 0;
let STORY_ITEM_INDEX = 0;
let STORY_TIMER = null;
const STORY_DURATION = 4000;

/** groups: sırayla gösterilecek mağaza hikaye grupları. startIndex: hangi gruptan başlanacağı. */
function openStoryViewer(groups, startIndex){
  if(!groups || groups.length === 0) return;
  STORY_GROUPS = groups;
  document.getElementById("storyOverlay").classList.add("open");
  showGroup(startIndex || 0);
}

function showGroup(groupIndex){
  if(groupIndex < 0 || groupIndex >= STORY_GROUPS.length){ closeStoryViewer(); return; }
  STORY_GROUP_INDEX = groupIndex;
  const group = STORY_GROUPS[groupIndex];
  document.getElementById("storyStoreNameText").textContent = group.storeName;
  document.getElementById("storyAvatar").innerHTML = productImageTag(group.storeAvatar, group.storeName);
  renderStoryProgress(group.items.length);
  showStory(0);
}

function renderStoryProgress(count){
  const row = document.getElementById("storyProgressRow");
  row.innerHTML = Array.from({ length: count }).map((_, i) => `<div class="story-seg"><div class="story-seg-fill" id="storySeg${i}"></div></div>`).join("");
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showStory(itemIndex){
  clearTimeout(STORY_TIMER);
  const group = STORY_GROUPS[STORY_GROUP_INDEX];
  group.items.forEach((_, idx) => {
    const fill = document.getElementById("storySeg" + idx);
    if(!fill) return;
    fill.style.transition = "none";
    fill.style.width = idx < itemIndex ? "100%" : "0%";
  });
  STORY_ITEM_INDEX = itemIndex;
  const item = group.items[itemIndex];
  const captionHtml = item.caption
    ? `<div class="story-caption">${escapeHtml(item.caption).replace(/\n/g, "<br>")}</div>`
    : "";
  document.getElementById("storyMedia").innerHTML = productImageTag(item.image, "hikaye") + captionHtml;
  requestAnimationFrame(() => {
    const fill = document.getElementById("storySeg" + itemIndex);
    if(fill){ fill.style.transition = `width ${STORY_DURATION}ms linear`; fill.style.width = "100%"; }
  });
  STORY_TIMER = setTimeout(nextStory, STORY_DURATION);
}

function nextStory(){
  const group = STORY_GROUPS[STORY_GROUP_INDEX];
  if(STORY_ITEM_INDEX < group.items.length - 1) showStory(STORY_ITEM_INDEX + 1);
  else showGroup(STORY_GROUP_INDEX + 1); // sıradaki markanın hikayesine geç, yoksa kapanır
}
function prevStory(){
  if(STORY_ITEM_INDEX > 0) showStory(STORY_ITEM_INDEX - 1);
  else if(STORY_GROUP_INDEX > 0) showGroup(STORY_GROUP_INDEX - 1);
  else showStory(0);
}
function closeStoryViewer(){
  clearTimeout(STORY_TIMER);
  const overlay = document.getElementById("storyOverlay");
  if(overlay) overlay.classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("storyOverlay");
  if(!overlay) return;
  document.getElementById("storyCloseBtn").addEventListener("click", closeStoryViewer);
  document.getElementById("storyZonePrev").addEventListener("click", prevStory);
  document.getElementById("storyZoneNext").addEventListener("click", nextStory);
  document.getElementById("storyZoneCenter").addEventListener("click", () => {
    const item = STORY_GROUPS[STORY_GROUP_INDEX].items[STORY_ITEM_INDEX];
    if(item && item.link) location.href = item.link;
  });
});
