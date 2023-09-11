const tabs = await chrome.tabs.query({});
console.log(tabs);
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" triggered`);
});

// add tabs to list of grouped tabs
const template = document.getElementById("li_template");
const elements = new Set();
for (const tab of tabs) {
  const element = template.content.firstElementChild.cloneNode(true);

  const title = tab.title.split("-")[0].trim();
  const pathname = new URL(tab.url).pathname.slice("/docs".length);

  element.querySelector(".title").textContent = title;
  element.querySelector(".pathname").textContent = pathname;
  element.querySelector("a").addEventListener("click", async () => {
    // need to focus window as well as the active tab
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  });

  elements.add(element);
}
document.getElementById("tab_list").append(...elements);

// create a groups called DOCS, and add all tabs to it
const groupTabsButton = document.querySelector("button");
groupTabsButton.addEventListener("click", async () => {
  const tabIds = tabs.map(({ id }) => id);
  const group = await chrome.tabs.group({ tabIds });
  await chrome.tabGroups.update(group, { title: "DOCS" });
});
