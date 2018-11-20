
function TabList() {
    this._query = "";
    this._include_urls = false;
    this._include_titles = true;
    this._tabs = [];
}

TabList.prototype.updateFilter = function() {
    return true;
}

Object.defineProperty(TabList.prototype, `query`, {
    get: function() {
        return this._query;
    },
    set: function(v) {
        this._query = v;
        //if(v.match(/^%([Uu])?/))
        let query_obj = {};
        if(v) {
            //how get any case
            query_obj.title=`*${v}*`;
        }
        browser.tabs.query(query_obj).then(
            (data) => this.tabs = data
        );
    }
});

Object.defineProperty(TabList.prototype, `tabs`, {
    get: function() {
        return this._tabs;
    },
    set: function(v) {
        let ul = document.querySelector(`#tab_list`);
        ul.innerHTML = "";
        this._tabs = v;
        this._tabs.forEach(
            t => {
                let li = document.createElement(`li`);
                li.innerHTML = t.title;
                li.setAttribute(`class`, `list-item`);
                ul.appendChild(li);
                li.addEventListener(`click`,
                    (e) => {
                        browser.windows.update(t.windowId, {
                            focused: true
                        });
                        browser.tabs.update(t.id, {
                            active: true,
                        });
                        //how close popup
                        //maybe use template html
                    }
                )
            }
        );

    }
})

    document.querySelector("#tab_query_field").addEventListener("keyup", function(e) {
        window.tabList.query = e.target.value;
    });


window.tabList = new TabList();
browser.tabs.query({}).then(
    (data) => window.tabList.tabs = data
);
