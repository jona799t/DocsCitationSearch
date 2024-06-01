let citations = []; // Kan ikke være i object/json da en af to identiske kilder så ville gå tabt

let searchFieldArea = document.createElement("div");
searchFieldArea.className = "kix-citations-list-view-top";
let searchField = document.createElement("div");
searchField.className = "kix-citations-search-input-container goog-block";
let searchInput = document.createElement("input");
searchInput.className = "kix-citations-search-input";
searchInput.id = "citation-search";
searchInput.placeholder = "Search for a citation";
searchField.oninput = input;
searchField.appendChild(searchInput)
searchFieldArea.appendChild(searchField)

let observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (!mutation.addedNodes) return;
        mutation.addedNodes.forEach(node => {
            if (node.classList) {
                if (node.classList.contains("kix-citations-list-view")) {
                    let sidebar = document.getElementsByClassName("kix-citations-list-view")[0];
                    sidebar.insertBefore(searchFieldArea, document.getElementsByClassName("kix-citations-source-list-container")[0]);
                    
                    document.getElementsByClassName("kix-citations-add-source-button")[0].onclick = inputReset;

                } else if (node.classList.contains("kix-citations-source-list-item")) {
                    if (node.classList.contains("search-added")) {
                        node.classList.remove("search-added");
                    } else {
                        citations.push({text: node.getElementsByClassName("kix-citations-source-list-item-content")[0].textContent.toLowerCase(), element: node});
                        console.log("[CitationSearch for Google Docs] Added citation:\n", citations.at(-1).text);
                    }
                } else if (node.classList.contains("kix-citations-source-list-item-menu")) {
                    node.childNodes[0].onclick = inputReset;
                }
            }
        });
        mutation.removedNodes.forEach(node => {
            if (node.classList && node.classList.contains("kix-citations-source-list-item")) {
                if (node.classList.contains("search-hidden")) {
                    node.classList.remove("search-hidden");
                } else {
                    const toDelete = node.getElementsByClassName("kix-citations-source-list-item-content")[0].textContent.toLowerCase();
                    console.log("[CitationSearch for Google Docs] Removed citation:\n", toDelete);
                    const index = citations.findIndex(citation => citation.text === toDelete); // Filter kan ikke bruges da den fjerner alle og ikke kun en
                    citations.splice(index, 1);

                    // Opdater søgningen:
                    input(null, document.getElementById("citation-search").value);
                }
            }
        });
    })
})

observer.observe(document.body, {
    childList: true,
    subtree: true
});

function input(element, query) {
    if (citations.length === 0) return;
    if (element) query = element.srcElement.value.toLowerCase();
    let filteredCitations;
    if (query === "") filteredCitations = citations;
    else filteredCitations = citations.filter(citation => {
        if (citation.text.includes(query)) return citation;
    });

    let list = document.getElementsByClassName("kix-citations-source-list")[0];
    [...list.getElementsByClassName("kix-citations-source-list-item")].forEach(citation => {
        citation.classList.add("search-hidden");
    });
    list.innerHTML = "";
    if (filteredCitations.length === 0) {
        list.innerHTML = 
            `<div class="kix-citations-create-view-zero-state">
                <div id="caidba:ss.kix-citations-source-list-zero-state-heading" class="kix-citations-source-list-zero-state-heading">No citations found</div>
                <div id="caidba:ss.kix-citations-source-list-zero-state-content" class="kix-citations-source-list-zero-state-content">Your search for <i>"${query}"</i> gave no results.</div>
            </div>`;
    } else filteredCitations.forEach(citation => {
        citation.element.className += " search-added";
        list.appendChild(citation.element);
    });
}

function inputReset() {
    searchInput.value = "";
    input(null, "");
}