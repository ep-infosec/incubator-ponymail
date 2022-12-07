/*
 Licensed to the Apache Software Foundation (ASF) under one or more
 contributor license agreements.  See the NOTICE file distributed with
 this work for additional information regarding copyright ownership.
 The ASF licenses this file to You under the Apache License, Version 2.0
 (the "License"); you may not use this file except in compliance with
 the License.  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/


// toggleCalendar: Expands/contracts years in the calendar (to show/hide months)
function toggleCalendar(year) {
    var cal = document.getElementById('cal_' + year)
    if (cal) {
        cal.style.display = (cal.style.display == 'none') ? 'block' : 'none';
        for (var i = 1970; i < 3000; i++) {
            var x = document.getElementById('cal_' + i)
            if (x && x != cal) {
                x.style.display = 'none'
            }
        }
    }
}


// buildCalendar: build the calendar
function buildCalendar(json) {
    var firstYear = json.firstYear
    var lastYear  = json.lastYear
    var firstMonth0 = json.firstMonth - 1 // 0-based
    var lastMonth0 = json.lastMonth - 1 // 0-based
    var monthly_emails = json.monthly_emails
    
    // Build the main calendar (desktop version)
    var dp = document.getElementById('datepicker')
    dp.style.width = "150px"
    dp.innerHTML = "<h3>Archive:</h3>"
    var fyear = lastYear ? lastYear : new Date().getFullYear();
    
    // Check we don't esplode
    if (fyear > new Date().getFullYear()) {
        fyear = new Date().getFullYear();
    }

    for (var year = fyear; year >= (firstYear ? firstYear : current_cal_min); year--) {
        var n = "none";
        if (fyear == firstYear) {
            n = "block"
        }
        var cale = ''
        var em = (new Date().getFullYear() == year) ? new Date().getMonth() : 11;
        for (var y = em; y >= 0; y--) {
            var yyyymm = (year+"-"+(y+1))
            var url = "list.html?" + xlist + ":" + yyyymm
            var yyyy0m = y < 9 ? (year+"-0"+(y+1)) : yyyymm
            if (monthly_emails[yyyy0m]) {
                var count = monthly_emails[yyyy0m]
                cale += "<a href='" + url + "' onclick='return false;'><label id='calmonth_" + yyyymm + "' style='width: 80px; float: left;cursor: pointer;' class='label label-default label-hover' onclick='toggleEmail(" + year + ", " + (y + 1) + ");' >" + months[y] + ' ('+ count + ')' + "</label></a><br/>"
            }
        }
        if (cale != '') {
            cale += "</div>"
            dp.innerHTML += "<label onmouseout='this.setAttribute(\"class\", \"label label-success\");'  onmouseover='this.setAttribute(\"class\", \"label label-warning\");' onclick='toggleCalendar(" + year + ");' class='label label-success' style='float: left; width: 110px; font-size: 11pt; cursor: pointer'>" + year + "</label><br/>"
            var calehdr = "<div style='float: left; width: 80%; display: " + n + "; padding-left: 15px; margin-bottom: 15px;' id='cal_" + year + "'>"
            dp.innerHTML += calehdr + cale
        }
    }
    
    // Build the mobile version (dropdown)
    var mdp = document.getElementById('datepicker_mobile')
    
    if (mdp) {
        mdp.innerHTML = ""
        for (var year = fyear; year >= (firstYear ? firstYear : current_cal_min); year--) {
            var n = "none";
            if (fyear == firstYear) {
                n = "block"
            }
            var ye = document.createElement('OPTGROUP');
            ye.label = year
            mdp.appendChild(ye)
            var em = (new Date().getFullYear() == year) ? new Date().getMonth() : 11;
            for (var y = em; y >= 0; y--) {
                var m = document.createElement('OPTION');
            var pfx = ''
            var sfx = ''
            if ((year == firstYear && y < firstMonth0) || (year == lastYear && y > lastMonth0)) {
                pfx = '('
                sfx = ')'
            }
                m.textContent = pfx + months[y] + ", " + year + sfx
                m.value = year + '-' + (y+1)
                ye.appendChild(m)
            }
        }
    }
}

// dailyStats: compiles the day-by-day stats for a chunk of emails
function dailyStats(json) {
    var days = {}
    for (var i in json) {
        var day = new Date(json[i].epoch * 1000).getUTCDate()
        days[day] = days[day] ? (days[day] + 1) : 1
    }
    var stats = []
    for (var z = 0; z < 32; z++) {
        stats.push(days[z] ? days[z] : 0)
    }
    return stats
}

function clearCalendarHover() {
    kiddos = []
    traverseThread(document.getElementById('datepicker'), 'calmonth', 'LABEL')
    for (var n in kiddos) {
        kiddos[n].setAttribute("class", "label label-default label-hover")
    }
}


// checkCalendar: keep the calendar in check with the result set
function checkCalendar(json) {
    if (json.list && !list_year[json.list]) {
        xlist = (json.list && json.list.search(/\*/) == -1) ? json.list : xlist
        list_year[json.list] = json.firstYear
        buildCalendar(json)
    }
    if (xlist != json.list || current_cal_min != json.firstYear) {
        buildCalendar(json)
        xlist = (json.list && json.list.search(/\*/) == -1) ? json.list : xlist
        current_cal_min = json.firstYear
    }
}

// buildStats: build the stats window
function buildStats(json, state, show) {
    var stats = document.getElementById('stats')
    
    stats.style.width = "300px"
    stats.innerHTML = "<br/><h4>Stats for this blob of emails:</h4>"

    if (!json.emails || json.emails.length == 0) {
        stats.innerHTML = "<br/><br/>No emails found matching this criteria"
        document.getElementById('emails').innerHTML = ""
        return;
    }

//  See bug 335 for why only equality matters here
    if (json.emails && json.emails.length == json.max) {
        stats.innerHTML += "<font color='#FA0'>Reached the limit of " + json.max.toLocaleString() + " emails, truncation may have occurred</font><br/>"
    }
    var ap = ""
    if (json.numparts && json.numparts > 1) {
        ap = " by " + json.numparts + " people"
    }
    stats.innerHTML += (json.emails.length ? json.emails.length : 0) + " emails sent" + ap + ", divided into " + json.no_threads + " topics."
    
    stats.innerHTML += "[<a href='trends.html" + document.location.search + "'>details</a>]"
    stats.innerHTML += "<br/>"

    var ts = "<table border='0'><tr>"
    var ms = dailyStats(json.emails)
    var max = 1
    for (var i in ms) {
        max = Math.max(max, ms[i])
    }
    for (var i in ms) {
        ts += "<td style='padding-left: 2px; vertical-align: bottom'><div title='" + ms[i] + " emails' style='background: #369; width: 6px; height: " + parseInt((ms[i] / max) * 60) + "px;'> </div></td>"
    }
    ts += "</tr></table>"
    stats.innerHTML += ts
    stats.innerHTML += "<h4>Top 10 contributors:</h4>"
    for (var i in json.participants) {
        if (i >= 10) {
            break;
        }
        var par = json.participants[i]
        if (par.name.length > 24) {
            par.name = par.name.substr(0, 23) + "..."
        }
        if (par.name.length == 0) {
            par.name = par.email
        }
        
        // Only logged-in users should be able to see actual email addresses here
        if (login && login.credentials) {
            stats.innerHTML += "<img src='https://secure.gravatar.com/avatar/" + par.gravatar + ".jpg?s=32&r=g&d=mm' style='vertical-align:middle'/>&nbsp;<a href='javascript:void(0)' onclick='searchTop(\"" + par.email + "\", current_retention);'><b>" + par.name.replace(/[<>]/g, "") + "</a>:</b> " + par.count + " email(s)<br/>";
        }
        else {
            stats.innerHTML += "<img src='https://secure.gravatar.com/avatar/" + par.gravatar + ".jpg?s=32&r=g&d=mm' style='vertical-align:middle'/>&nbsp;<b title='Log in to see the email address of this person'>" + par.name.replace(/[<>]/g, "") + ":</b> " + par.count + " email(s)<br/>";
        }
    }


    
    var btn = document.createElement('a')
    btn.setAttribute("href", "javascript:void(0);")
    btn.setAttribute("class", "btn btn-warning")
    btn.setAttribute("onclick", "prefs.hideStats='yes'; saveEphemeral(); buildStats(old_json, old_state, false);")
    btn.style.marginRight = "10px"
    btn.style.marginTop = "10px"
    btn.innerHTML = "Hide stats"
    stats.appendChild(btn)
    if (prefs.hideStats == 'yes' || show == false) {
        var dwidth = document.getElementById('datepicker').offsetParent === null ? 0 : document.getElementById('datepicker').offsetWidth
        var sw =  dwidth + 20;
        document.getElementById('emails_parent').style.width = "calc(100% - " + sw + "px)"
        // Resize on resize to work around CSS bug. Might wanna move this elsewhere later on..
        window.onresize = function() {
            // If calendar is hidden, we set it to 0 px, otherwise use the offset width
            var dwidth = document.getElementById('datepicker').offsetParent === null ? 0 : document.getElementById('datepicker').offsetWidth
            var sw =  dwidth + 20;
            // set list view to 99% - calendar
            document.getElementById('emails_parent').style.width = "calc(100% - " + sw + "px)"
        }
        document.getElementById('emails_parent').style.width = "calc(100% - " + sw + "px)"
        stats.setAttribute("class", "col-md-1 vertical-text")
        stats.innerHTML = "<div onclick=\"prefs.hideStats='no'; saveEphemeral(); buildStats(old_json, old_state, true);\">Show stats panel..</div>"
    }
    if (prefs.hideStats == 'no' || show == true) {
        stats.setAttribute("class", "hidden-xs hidden-sm col-md-3 col-lg-3")
        var dwidth = document.getElementById('datepicker').offsetParent === null ? 0 : document.getElementById('datepicker').offsetWidth
        var sw =  dwidth + 30 + stats.offsetWidth;
        document.getElementById('emails_parent').style.width = "calc(100% - " + sw + "px)"
        // Resize on resize to work around CSS bug. Might wanna move this elsewhere later on..
        window.onresize = function() {
            // If calendar is hidden, we set it to 0 px, otherwise use the offset width
            var dwidth = document.getElementById('datepicker').offsetParent === null ? 0 : document.getElementById('datepicker').offsetWidth
            // include stats width
            var sw =  dwidth + 30 + stats.offsetWidth;
            // set list view to 99% - calendar - stats
            document.getElementById('emails_parent').style.width = "calc(99% - " + sw + "px)"
        }
        stats.removeAttribute("onclick")
        //stats.style.display = "block"
        if (json.cloud) {
            for (var i in json.cloud) {
                stats.innerHTML += "<h4 style='text-align: center;'>Hot topics:</h4>"
                stats.appendChild(wordCloud(json.cloud, 250, 80, pm_config.debug))
                break // so..this'll run if cloud has stuff, otherwise not.
            }
        }
    }
}


// swipeListView: scroll up/down the list view (previous/next page view)
function swipeListView(e) {
    var direction = ((e.wheelDelta || -e.detail) < 0) ? 'down' : 'up'
    var js = old_json //prefs.displayMode == 'flat' ? current_flat_json : current_json
    var jlen = prefs.displayMode == 'flat' ? current_flat_json.length : js.thread_struct.length
    if (openEmail() || ($("body").height() > $(window).height())) {
        return
    }
    if (direction == 'down') {
        if ((jlen - c_page) > d_ppp) {
            var np = Math.min(jlen, c_page + d_ppp)
            viewModes[prefs.displayMode].list(js, d_ppp, np, false);
        }
    }
    if (direction == 'up') {
        var np = Math.max(0, c_page - d_ppp)
        viewModes[prefs.displayMode].list(js, d_ppp, np, false);
    }
}

// buildPage: build the entire page!
function buildPage(json, state) {
    loadEphemeral(); // load ephem config if need be
    start = new Date().getTime()
    pb_refresh = start
    json = json ? json : old_json
    old_json = json
    old_state = state
    current_thread_mids = []
    checkCalendar(json)
    document.title = json.list + " - Pony Mail!"
    
    // if we have xdomain, rewrite the wording in quick search.
    var lcheckall = document.getElementById('sloa')
    if (lcheckall && gxdomain) {
        lcheckall.innerHTML = "All " + gxdomain + " lists"
    }
    
    // Add Opensearch title to OS image
    var os = document.getElementById('opensearch')
    if (os){
        os.setAttribute("title", "Add " + gxdomain + " archives to your search engines")
    }

    buildStats(json, state, null)
    
    nest = ""
    
    // Add/reset list view modes
    var vmobj = document.getElementById('viewmode')
    vmobj.innerHTML = "" // reset innerhtml
    for (var mode in viewModes) {
        var opt = document.createElement('option')
        opt.setAttribute("value", mode)
        opt.text = mode
        opt.title = viewModes[mode].description
        if (mode == prefs.displayMode) {
            opt.setAttribute("selected", "selected")
        }
        vmobj.appendChild(opt)
    }

    viewModes[prefs.displayMode].list(json, 0, 0, state ? state.deep : false);
    if (!json.emails || !json.emails.length || json.emails.length == 0) {
        // prepend the message rather than replacing the buttons
        document.getElementById('emails').innerHTML = "<h3>No emails found that fit the search criteria</h3>" + document.getElementById('emails').innerHTML
    }
    if (json.private && json.private == true) {
        document.getElementById('emails').innerHTML += "<h4>Looks like you don't have access to this archive. Maybe you need to be logged in?</h4>"
    }
    if (json.took) {
        var rtime = new Date().getTime() - start
        document.getElementById('emails').addEventListener("mousewheel", swipeListView, false);
        document.getElementById('emails').addEventListener("DOMMouseScroll", swipeListView, false);
        
        document.getElementById('emails').innerHTML += "<br/><br/><small><i>Compiled in " + parseInt(json.took / 1000) + "ms, rendered in " + rtime + "ms</i></small>"
    }
    if (json.debug && pm_config.debug) {
        document.getElementById('emails').innerHTML += "<br/><br/><small><i>Debug times: " + json.debug.join(" + ") + "</i></small>"
    }
}


// getListInfo: Renders the top ML index
function getListInfo(list, xdomain, nopush) {
    current_query = ""
    current_retention = DEFAULT_RETENTION
    var dealtwithit = false
    if (xdomain && xdomain.search("utm_source=opensearch") != -1) {
        var strs = xdomain.split(/&/)
        for (var i in strs) {
            var kv = strs[i].split(/=/)
            if (kv[0] == "websearch") {
                current_query = kv[1]
            }
            if (kv[0] == "domain") {
                xdomain = kv[1]
                xlist = "*@" + xdomain;
                list = xlist;
                if (document.getElementById('checkall')) {
                    document.getElementById('checkall').checked = true
                }
            }
        }
        nopush = true
        dealtwithit = true
        search(current_query, DEFAULT_RETENTION, true, true)
    }
    else if (xdomain && xdomain != "") {
        if (xdomain.length <= 1) {
            xdomain = null
        } else {
            if (xdomain.search(/:/) != -1) {
                var arr = xdomain.split(/:/)
                xdomain = arr[0]
                current_query = unescape(arr[2] || '')
                xlist = xdomain
                // ensure query is not ignored
                if (current_query == "" && arr[1].match(/-/) && !arr[1].match(/\|/)) {
                    var ya = arr[1].split(/-/)
                    toggleEmail(ya[0], ya[1], nopush)
                    current_retention = arr[1]
                    dealtwithit = true
                } else {
                    current_retention = parseInt(arr[1])
                    if (("x"+current_retention) != ("x"+arr[1])) {
                        current_retention = arr[1]
                        nopush = true
                    }
                }
            }
            if (xdomain.search(/@/) != -1) {
                list = xdomain;
                xlist = list
                xdomain = xdomain.replace(/^.*?@/, "")

            }
        }
    }
    if ((xdomain == undefined || xdomain == "") && list) {
        xdomain = list.replace(/^.*?@/, "")
    }
    
    // If invalid address passed, complain and exit - no need to attempt fetching stats
    // N.B. Only check list and xdomain if they are defined
    if ((list && ! valid_address(list)) || (xdomain && ! valid_address(xdomain))) {
        alert("Invalid mailing list address supplied!");
        return
    }

    // Sort lists by usage before we enter here...
    var listnames = []
    if (all_lists[xdomain]) {
        for (var key in all_lists[xdomain]) {
            listnames.push(key)
        }
        var overlaps = []
        listnames = listnames.sort(function(a, b) {
            return all_lists[xdomain][b] - all_lists[xdomain][a]
        })
    }
        
        
    if (!list || list.length <= 1) {
        
        // List may be private...who knows?
        if ((list && list.length > 1) && (!login || !login.credentials)) {
            popup("List not found!", "Looks like this list is either not here or private.<br>You can try <a href='" + URL_BASE + "/oauth.html'>Logging in</a> to resolve the situation.")
        }
        else {
            if (listnames.length > 0 && xdomain) {
                for (var i in listnames) {
                    // do we have a dev list? :3
                    if (listnames[i] == 'dev') {
                        window.location.search = 'dev@' + xdomain
                        return
                    }
                }
                // no dev list, find the busiest one!
                window.location.search = listnames[0] + '@' + xdomain
            }
        }
    }
    if (!firstVisit && !nopush) {
        window.history.pushState({}, "", "list.html?" + xlist);
        firstVisit = false
    }

    //buildCalendar()
    // Bail if no list is still found - search.html probably
    if (!list) {
        return
    }
    mbox_month = null;
    var dp = document.getElementById('d')
    dp.value = datePickerValue(current_retention)
    dp.setAttribute("data", current_retention)
    
    if (current_retention.toString().search(/^\d+-\d+$/)) {
        mbox_month = current_retention
    }
    
    document.getElementById('q').value = unescape(current_query)
    document.getElementById('aq').value = unescape(current_query)
    xlist = list;
    var arr = list.split('@', 2)
    var listname = arr[0]
    var domain = arr[1]


    var lc = document.getElementById('lc_dropdown');
    lc.innerHTML = ""
    var dom_sorted = []
    for (var dom in all_lists) {
        dom_sorted.push(dom)
    }

    // Sort out available domains with MLs
    for (var i in dom_sorted.sort()) {
        var dom = dom_sorted[i]
        var li = document.createElement("li")
        var a = document.createElement("a")
        var t = document.createTextNode(dom)
        a.setAttribute("href", URL_BASE + "/list.html?" + dom)
        a.appendChild(t)
        li.appendChild(a)
        lc.appendChild(li)
    }

    // If we have a domain ML listing, sort out the nav bar
    if (all_lists[xdomain]) {
        var ll = document.getElementById('listslist')
        ll.innerHTML = ""
        for (var i in listnames) {

            var key = listnames[i]
            var collapse = ''
            if (listnames.length > 5 && i >= 4) {
                collapse = 'hidden-xs hidden-sm hidden-md hidden-lg'
                overlaps.push(key)
            }
            var ln = key + '@' + xdomain
            //alert("adding" + ln)
            var li = document.createElement("li")
            var a = document.createElement("a")
            var t = document.createTextNode(key + '@')
            a.setAttribute("href", "javascript:void(0);")
            a.setAttribute("onclick", "getListInfo(this.getAttribute('id'))")
            a.setAttribute("id", ln)
            a.appendChild(t)
            li.appendChild(a)
            ll.appendChild(li)
            if (typeof all_lists[xdomain][listname] == 'undefined') {
                if (list && list.length > 1) {
                    popup("List not found!", "Looks like this list is either not here or private.<br>You can try <a href='" + URL_BASE + "/oauth.html'>Logging in</a> to resolve the situation.")
                } else {
                    listname = key
                    list = ln
                    xlist = ln
                }
            }
            if (list == ln) {
                li.setAttribute("class", "active " + collapse)
            } else {
                li.setAttribute("class", collapse)
            }
        }
        if (overlaps.length > 0) {
            overlaps.sort()
            ll.innerHTML += '<li class="dropdown navbar-right" id="otherlists"><a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Other lists:<span class="caret"></span></a><ul class="dropdown-menu" style="overflow: auto; max-height: 500px;" id="otherlists_dropdown"></ul></li>'
            var ul = document.getElementById('otherlists_dropdown')
            for (var i in overlaps) {
                var key = overlaps[i]
                var ln = key + '@' + xdomain
                
                var li = document.createElement("li")
                var a = document.createElement("a")
                var t = document.createTextNode(key + '@')
                a.setAttribute("href", "javascript:void(0);")
                a.setAttribute("onclick", "getListInfo(this.getAttribute('id'))")
                a.setAttribute("id", ln)
                a.appendChild(t)
                li.appendChild(a)
                ul.appendChild(li)
                if (list == ln) {
                    li.setAttribute("class", "active")
                } else {
                    li.setAttribute("class", "")
                }
            }
        }

    } else {
        // no such domain, report this as a missing list
        popup("List not found!", "Looks like this list is either not here or private.<br>You can try <a href='" + URL_BASE + "/oauth.html'>Logging in</a> to resolve the situation.")        
    }
    gxdomain = xdomain
    addSearchBar();
    if (!dealtwithit) {
        kiddos = []
        traverseThread(document.getElementById('datepicker'), 'calmonth', 'LABEL')
        for (var n in kiddos) {
            kiddos[n].setAttribute("class", "label label-default label-hover")
        }
        document.getElementById('listtitle').innerHTML = list + ", last month <a href='api/atom.lua?list=" + list + "'><img src='images/atom.png'></a>"
        if (current_query == "" && (current_retention == "" || current_retention == DEFAULT_RETENTION)) {
            global_deep = false
            current_query = ""
            GetAsync("/api/stats.lua?list=" + listname + "&domain=" + domain, null, buildPage)
            if (!nopush) {
                window.history.pushState({}, "", "list.html?" + xlist);
            }
        } else {
            search(current_query, current_retention, nopush)
        }
    }
    
}

function setQuickSearchDateRange() {
    var dp = document.getElementById('d')
    var qdr = document.getElementById('qs_date')
    if (dp && qdr && qdr.innerHTML != dp.value) {
        qdr.innerHTML = dp.value
    }
}

window.setInterval(setQuickSearchDateRange, 250)
