var b;
try {
    b = browser;
} catch(e) {
    b = chrome;
}

function TabList() {
    this._query = "";
    this._filter = "";
    this._flags = {
        url: false,
        title: true,
    }
    this._tabs = [];
    this._filtered = [];
    this._highlight = -1;
}

TabList.prototype.updateFilter = function() {
    return true;
}

TabList.prototype.renderTabs = function() {
    let selected = i => i == this.highlight;
    let ul = document.querySelector(`#tab_list`);
    let re = new RegExp(`${this._filter}`, 'i');
    ul.innerHTML = ""; 
    this._filtered = this._tabs.filter(
        tab => {
            if (!this._filter) return true;
            return (tab.title.match(re) && this._flags.title) || (tab.url.match(re) && this._flags.url);
        }
    )
    console.log(this._filtered);
    if(this.highlight > this._filtered.length-1) {
        this._highlight = this._filtered.length-1;
    }
    this._filtered.forEach(
        (t,i) => {
            let li = document.createElement(`li`);
            let a = document.createElement(`a`);
            a.innerHTML = t.title;
            a.setAttribute(`class`, `${selected(i) ? "is-active":""} ${t.active ? "activeokom":""}`);
            
            li.appendChild(a);
            ul.appendChild(li);
            //maybe add some selected attr? could make select instead of list
            
            li.addEventListener(`click`,
                (e) => {
                    b.windows.update(t.windowId, {
                        focused: true
                    });
                    b.tabs.update(t.id, {
                        active: true,
                    });
                    window.close();
                    //maybe use template html
                }
            )
            if(selected(i)) {
                li.focus();
            }
        }
    );
    if (this.highlight<0) {
        document.querySelector("input").focus();
    } 
}

Object.defineProperty(TabList.prototype, `query`, {
    get: function() {
        return this._query;
    },
    set: function(v) {
        let changed = (t, u, s) => t != this._flags.title || u != this._flags.url || s != this._filter;
        let title = !v.match(/^%U?/);
        let url = v.match(/^%[Uu]/);
        let filter_string = v.replace(/^%[Uu]?/, '');
        if (changed(title, url, filter_string)) {
            this._flags = {
                title, url
            }
            this._filter = filter_string;
            this.renderTabs();
        }
    }
});

Object.defineProperty(TabList.prototype, `tabs`, {
    get: function() {
        return this._tabs;
    },
    set: function(v) {
        this._tabs = v;
        this.renderTabs();
        //if we need to? ...
    }
});

Object.defineProperty(TabList.prototype, 'highlight', {
    get() { return this._highlight },
    set(v) {
        if(v < this._highlight && this._highlight == -1) {
            return;
        } else if(v == this._filtered.length) {
            this._highlight = this._filtered.length - 1;
        } else if(v > this._filtered.length) {
            this._highlight = 0;
        } else {
            this._highlight = v;
        }
        this.renderTabs();
    }
});



document.querySelector("#tab_query_field").addEventListener("keyup", function(e) {
    tabList.query = e.target.value;
});
document.querySelector("#tab_query_field").addEventListener("keydown", function(e) {
    switch(e.key) {
        case `ArrowUp`:
            tabList.highlight -= 1;
            break;
        case `ArrowDown`:
            tabList.highlight += 1;
            break;
        case `Enter`:
            //get tab by id based on highlight... ???
            if(tabList.highlight >= 0) {
                let t = tabList._filtered[tabList.highlight];
                b.windows.update(t.windowId, {
                    focused: true
                });
                b.tabs.update(t.id, {
                    active: true,
                });
                window.close();
            }
            break;
        case `Backspace`:
            if(e.ctrlKey && tabList.highlight >= 0) {
                b.tabs.remove(tabList._filtered[tabList.highlight].id);
                b.tabs.query({}).then(
                    (data) => {
                        tabList.tabs = data;
                        tabList.renderTabs();
                    });
                e.preventDefault();
            }
            break;
        default:
            break;
    }
});
document.querySelector(`#tab_query_field`).addEventListener(`click`, function(e) {
    tabList.highlight = -1;
});

tabList = new TabList();

b.tabs.query({}).then(
    (data) => tabList.tabs = data
);
tabList.renderTabs();