//https://gist.github.com/eligrey/1138724
var request = (function(view) {
  "use strict";
  var
    XHR = XMLHttpRequest
    , BB = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder
    , DOMURL = view.URL || view.webkitURL || view
    , dom_parser = new DOMParser
    , resp_type_supported = "responseType" in new XHR
    , buff_supported
    , blob_supported
    , text_supported
    , doc_supported
    , request = function(opts) {
      var
        url = opts.url
        , data = "data" in opts ? opts.data : null
      // type can be buffer, blob, text, or document
      // note that the blob type is unsupported in FF5 without BlobBuilder.js
        , type = opts.type || "buffer"
        , blob_req = type === "blob"
        , buff_req = type === "buffer"
        , binary_req = buff_req || blob_req
        , doc_req = type === "document"
        , text_req = type === "text"
        , resp_type = type
        , callback = opts.callback
        , onerror = opts.onerror
        , req = new XHR
        ;
      req.open(data === null ? "GET" : "POST", url, true);
      if (buff_req || blob_req && !blob_supported) {
        resp_type = "arraybuffer"
      }
      if (doc_req && !doc_supported) {
        resp_type = "";
      }
      req.responseType = resp_type;
      if (callback) {
        req.addEventListener("load", function() {
          var
            type = req.getResponseHeader("Content-Type")
            , data = req.response
            , text, bb
            ;
          if (binary_req) {
            data = data || req.mozResponseArrayBuffer;
            if (blob_req && !blob_supported) {
              bb = new BB;
              bb.append(data);
              data = bb.getBlob(type);
            }
          } else if (text_req) {
            data = data || req.responseText;
          } else if (doc_req) {
            if (!doc_supported) {
              data =
                req.responseXML
                  || dom_parser.parseFromString(req.responseText, type)
              ;
            }
          }
          callback.call(req, data);
        }, false);
      }
      if (onerror) {
        req.addEventListener("error", function() {
          onerror.apply(req, arguments);
        }, false);
      }
      req.send(data);
      return req;
    }
    , test_object_url
    , test_resp_type = function(type) {
      var test_req = new XHR;
      test_req.open("GET", test_object_url, false);
      test_req.responseType = type;
      test_req.send();
      return test_req.response !== null;
    }
    ;
  if (resp_type_supported && BB) {
    test_object_url = DOMURL.createObjectURL((new BB).getBlob("text/html"));
    buff_supported = test_resp_type("arraybuffer")
    blob_supported = test_resp_type("blob");
    text_supported = test_resp_type("text")
    doc_supported = test_resp_type("document");
    DOMURL.revokeObjectURL(test_object_url);
  }
  return request;
}(self));