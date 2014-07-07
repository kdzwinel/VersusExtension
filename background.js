"use strict";

function arrayUnique(a) {
  return a.reduce(function(p, c) {
    if (p.indexOf(c) < 0) p.push(c);
    return p;
  }, []);
}

function filterEmpty(a) {
  return a.reduce(function(p, c) {
    if (c.length > 0) p.push(c);
    return p;
  }, []);
}

function splitIntoQueries(string) {
  var queries = string.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

  queries = queries || [];

  queries = queries.map(function (query) {
    query = query.trim();

    //trimming quotes
    query = (query.substr(0,1) === '"') ? query.slice(1) : query;
    query = (query.substr(-1,1) === '"') ? query.slice(0, query.length - 1) : query;

    return query;
  });

  queries = filterEmpty(queries);
  queries = arrayUnique(queries);

  return queries;
}

chrome.omnibox.onInputChanged.addListener(
  function (text, suggest) {
    var queries = splitIntoQueries(text);
    var description = [];
    queries.forEach(function(query) {
      description.push('<match>"' + query + '"</match>');
    });

    if(queries.length > 0) {
      suggest([
        {content: queries.join(', '), description: 'Compare: ' + description.join(', ')}
      ]);
    } else {
      suggest([]);
    }
  });

chrome.omnibox.onInputEntered.addListener(
  function (text) {
    var queries = splitIntoQueries(text);

    chrome.tabs.create({
      url: chrome.extension.getURL('result.html') + '#' + JSON.stringify(queries)
    });
  });