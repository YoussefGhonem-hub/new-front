! function (e, r) {
    "use strict";
    r.element(e.document).on("shown.bs.modal", ".modal", function () {
        e.setTimeout(function () {
            r.element("[autofocus]", this).focus();
        }.bind(this), 100);
    }), r.element(e.document).on("click", function () {
        r.element("#context-menu").hide();
    }), r.element(e.document).on("contextmenu", '.main-navigation .table-files tr.item-list:has("td"), .item-list', function (n) {
        var i = r.element("#context-menu");
        n.pageX >= e.innerWidth - i.width() && (n.pageX -= i.width()), n.pageY >= e.innerHeight - i.height() && (n.pageY -= i.height()), i.hide().css({
            left: n.pageX,
            top: n.pageY
        }).appendTo("body").show(), n.preventDefault();
    }), Array.prototype.find || (Array.prototype.find = function (e) {
        if (null == this) throw new TypeError("Array.prototype.find called on null or undefined");
        if ("function" != typeof e) throw new TypeError("predicate must be a function");
        for (var r, n = Object(this), i = n.length >>> 0, a = arguments[1], t = 0; t < i; t++)
            if (r = n[t], e.call(a, r, t, n)) return r;
    });
}(window, angular),
    function (e) {
        "use strict";
        e.module("eServices").controller("FileManagerCtrl", ["$scope", "$rootScope", "$window", "$filter", "fileManagerConfig", "item", "fileNavigator", "$http", "fileManagerConfig", "SweetAlert", "apiMiddleware",
            function (r, n, i, a, t, o, s, h, fm, sw, l) {
                var d = i.localStorage;
                    r.translateFilter = a('translate'),
                    r.config = t, r.reverse = !1, r.predicate = ["model.type", "model.name"], r.order = function (e) {
                        r.reverse = r.predicate[1] === e && !r.reverse, r.predicate[1] = e;
                    }, r.query = "", r.fileNavigator = new s, r.apiMiddleware = new l, r.uploadFileList = [], r.viewTemplate = d.getItem("viewTemplate") || "main-icons.html", r.fileList = [], r.temps = [], r.$watch("temps", function () {
                        r.singleSelection() ? r.temp = r.singleSelection() : (r.temp = new o({
                            rights: 644
                        }), r.temp.multiple = !0), r.temp.revert();
                    }),
                    r.deferredHandler = function (l, t, n, i) {
                        return l && "object" == typeof l || (this.error = "Error %s - Bridge response error, please check the API docs or this ajax response.".replace("%s", n)), 404 == n && (this.error = "Error 404 - Backend bridge is not working, please check the ajax response."), 200 == n && (this.error = null), !this.error && l.result && l.result.error && (this.error = l.result.error), !this.error && l.error && (this.error = l.error.message), !this.error && i && (this.error = i), this.error ? t.reject(l) : t.resolve(l);
                    },
                    /*---------------------------Pagination starts-------------------------*/     
                    n.selectedModalPath = r.fileNavigator.currentPath;  
                    r.feed = {};
                    r.feed.configs = [
                    {
                        'name': '10',
                        'value': '10'
                    },
                    {
                        'name': '25',
                        'value': '25'
                    },
                    {
                        'name': '50',
                        'value': '50'
                    },
                    {
                        'name': '100',
                        'value': '100'
                    }];
                    r.feed.config = r.feed.configs[0].value;
                    r.itemsPerPage = r.feed.config;
                    //r.itemsPerPage = 10;
                    r.maxSize = 5;
                    r.pageChanged = function (currntPage) {
                        r.currentPageIndex = currntPage;
                        this.apiMiddleware.list(n.selectedModalPath, this.deferredHandler.bind(this), currntPage, r.itemsPerPage);
                        r.fileNavigator.refresh(r.currentPageIndex, r.itemsPerPage);
                    },
                    r.setItemsPerPage = function (num) {
                        r.itemsPerPage = num;
                        var currentPage = 1;
                        this.apiMiddleware.list(n.selectedModalPath, this.deferredHandler.bind(this), currentPage, r.itemsPerPage);
                        r.fileNavigator.refresh(currentPage, r.itemsPerPage);
                     },
                    /*------------------------------Pagination ends------------------------------------------*/
                    r.fileNavigator.onRefresh = function () {
                        //Get total records count
                        n.selectedModalPath = r.fileNavigator.currentPath;
                        var data = {
                            action: "list",
                            path: '/' + (n.selectedModalPath).join('/')
                        };
                        h.post(fm.totalRecordCount, data).then(function (o) {
                            r.totalItems = o.data;
                        });
                        r.temps = [], r.query = "", n.selectedModalPath = r.fileNavigator.currentPath;
                    },
                    r.setTemplate = function (e) {
                        d.setItem("viewTemplate", e), r.viewTemplate = e;
                    }, r.isSelected = function (e) {
                        return -1 !== r.temps.indexOf(e);
                    }, r.selectOrUnselect = function (e, n) {
                        var i = r.temps.indexOf(e),
                            a = n && 3 == n.which;
                        if (n && n.target.hasAttribute("prevent")) r.temps = [];
                        else if (!(!e || a && r.isSelected(e))) {
                            if (n && n.shiftKey && !a) {
                                var t = r.fileList,
                                    o = t.indexOf(e),
                                    s = r.temps[0],
                                    l = t.indexOf(s),
                                    d = void 0;
                                if (s && t.indexOf(s) < o) {
                                    for (r.temps = []; l <= o;) d = t[l], !r.isSelected(d) && r.temps.push(d), l++;
                                    return;
                                }
                                if (s && t.indexOf(s) > o) {
                                    for (r.temps = []; l >= o;) d = t[l], !r.isSelected(d) && r.temps.push(d), l--;
                                    return;
                                }
                            } !n || a || !n.ctrlKey && !n.metaKey ? r.temps = [e] : r.isSelected(e) ? r.temps.splice(i, 1) : r.temps.push(e);
                        }
                    }, r.singleSelection = function () {
                        return 1 === r.temps.length && r.temps[0];
                    }, r.totalSelecteds = function () {
                        return {
                            total: r.temps.length
                        };
                    }, r.selectionHas = function (e) {
                        return r.temps.find(function (r) {
                            return r && r.model.type === e;
                        });
                    }, r.prepareNewFolder = function () {
                        var e = new o(null, r.fileNavigator.currentPath);
                        return r.temps = [e], e;
                    }, r.smartClick = function (e) {
                        var n = r.config.allowedActions.pickFiles;
                        if (e.isFolder()) return r.fileNavigator.folderClick(e);
                        if ("function" == typeof r.config.pickCallback && n) {
                            if (!0 === r.config.pickCallback(e.model)) return;
                        }
                        return e.isImage() ? r.config.previewImagesInModal ? r.openImagePreview(e) : r.apiMiddleware.download(e, !0) : e.isEditable() ? r.openEditItem(e) : void 0
                    }, r.openImagePreview = function () {
                        var e = r.singleSelection();
                        r.apiMiddleware.apiHandler.inprocess = !0, r.modal("imagepreview", null, !0).find("#imagepreview-target").attr("src", r.getUrl(e)).unbind("load error").on("load error", function () {
                            r.apiMiddleware.apiHandler.inprocess = !1, r.$apply();
                        });
                    }, r.openEditItem = function () {
                        var e = r.singleSelection();
                        r.apiMiddleware.getContent(e).then(function (r) {
                            e.tempModel.content = e.model.content = r.result;
                        }), r.modal("edit");
                    }, r.modal = function (n, i, a) {
                        var t = e.element("#" + n);
                        return t.modal(i ? "hide" : "show"), r.apiMiddleware.apiHandler.error = "", r.apiMiddleware.apiHandler.asyncSuccess = !1, !a || t
                    }, r.modalWithPathSelector = function (e) {
                        return n.selectedModalPath = r.fileNavigator.currentPath, r.modal(e);
                    }, r.isInThisPath = function (e) {
                        return -1 !== (r.fileNavigator.currentPath.join("/") + "/").indexOf(e + "/");
                    }, r.edit = function () {
                        r.apiMiddleware.edit(r.singleSelection()).then(function () {
                            r.modal("edit", !0);
                        });
                    }, r.changePermissions = function () {
                        r.apiMiddleware.changePermissions(r.temps, r.temp).then(function () {
                            r.fileNavigator.refresh(r.currentPageIndex, r.itemsPerPage), r.modal("changepermissions", !0);
                        });
                    }, r.download = function () {
                        var ev = r.singleSelection();
                        if (!r.selectionHas("dir")) return ev ? r.apiMiddleware.download(ev) : r.apiMiddleware.downloadMultiple(r.temps);
                    }, r.copy = function () {
                        var e = r.singleSelection();
                        if (e) {
                            var i = e.tempModel.name.trim();
                            if (r.fileNavigator.fileNameExists(i) && c(e)) return r.apiMiddleware.apiHandler.error = a.instant("error_invalid_filename"), !1;
                            if (!i) return r.apiMiddleware.apiHandler.error = a('translate')("error_invalid_filename"), !1;
                        }
                        r.apiMiddleware.copy(r.temps, n.selectedModalPath).then(function () {
                            r.fileNavigator.refresh(r.currentPageIndex, r.itemsPerPage), r.modal("copy", !0);
                        });
                    }, r.compress = function () {
                        var e = r.temp.tempModel.name.trim();
                        return r.fileNavigator.fileNameExists(e) && c(r.temp) ? (r.apiMiddleware.apiHandler.error = a('translate')("error_invalid_filename"), !1) : e ? void r.apiMiddleware.compress(r.temps, e, n.selectedModalPath).then(function () {
                            if (r.fileNavigator.refresh(r.currentPageIndex, r.itemsPerPage), !r.config.compressAsync) return r.modal("compress", !0);
                            r.apiMiddleware.apiHandler.asyncSuccess = !0;
                        }, function () {
                            r.apiMiddleware.apiHandler.asyncSuccess = !1;
                        }) : (r.apiMiddleware.apiHandler.error = a('translate')("error_invalid_filename"), !1);
                    }, r.extract = function () {
                        var e = r.temp,
                            i = r.temp.tempModel.name.trim();
                        return r.fileNavigator.fileNameExists(i) && c(r.temp) ? (r.apiMiddleware.apiHandler.error = a('translate')("error_invalid_filename"), !1) : i ? void r.apiMiddleware.extract(e, i, n.selectedModalPath).then(function () {
                            if (r.fileNavigator.refresh(r.currentPageIndex, r.itemsPerPage), !r.config.extractAsync) return r.modal("extract", !0);
                            r.apiMiddleware.apiHandler.asyncSuccess = !0;
                        }, function () {
                            r.apiMiddleware.apiHandler.asyncSuccess = !1;
                        }) : (r.apiMiddleware.apiHandler.error = a('translate')("error_invalid_filename"), !1);
                    }, r.remove = function () {
                        r.apiMiddleware.remove(r.temps).then(function () {
                            r.fileNavigator.refresh(r.currentPageIndex, r.itemsPerPage), r.modal("remove", !0);
                        });
                    }, r.move = function () {
                        var e = r.singleSelection() || r.temps[0];
                        if (e && c(e)) return r.apiMiddleware.apiHandler.error = a('translate')("error_cannot_move_same_path"), !1;
                        r.apiMiddleware.move(r.temps, n.selectedModalPath).then(function () {
                            r.fileNavigator.refresh(r.currentPageIndex, r.itemsPerPage), r.modal("move", !0);
                        });
                        }, r.rename = function () {
                        var e = r.singleSelection(),
                            n = e.tempModel.name,
                            i = e.tempModel.path.join("") === e.model.path.join("");
                        if (!n || i && r.fileNavigator.fileNameExists(n)) return r.apiMiddleware.apiHandler.error = a('translate')("error_invalid_filename"), !1;
                        r.apiMiddleware.rename(e).then(function () {
                            r.fileNavigator.refresh(r.currentPageIndex, r.itemsPerPage), r.modal("rename", !0);
                        });
                    }, r.createFolder = function () {
                        var e = r.singleSelection(),
                            n = e.tempModel.name;
                        if (!n || r.fileNavigator.fileNameExists(n)) return r.apiMiddleware.apiHandler.error = a('translate')("error_invalid_filename");
                        r.apiMiddleware.createFolder(e).then(function () {
                            r.fileNavigator.refresh(r.currentPageIndex, r.itemsPerPage), r.modal("newfolder", !0);
                        });
                    }, r.addForUpload = function (e) {
                        r.uploadFileList = r.uploadFileList.concat(e), r.modal("uploadfile");
                    }, r.removeFromUpload = function (e) {
                        r.uploadFileList.splice(e, 1);
                    }, r.uploadFiles = function () {
                        r.apiMiddleware.upload(r.uploadFileList, r.fileNavigator.currentPath).then(function (e) {
                            let file = r.uploadFileList;
                            if (e.result[0].isExist == true) {
                                sw.swal({
                                    title: r.translateFilter('systemManagement.replace_skip'),
                                    text: r.translateFilter('systemManagement.replace_skipMsg'),
                                    type: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: "Ok",
                                    cancelButtonText: "Cancel",
                                    closeOnConfirm: true,
                                    closeOnCancel: true
                                },
                                    function (isConfirm) {
                                        if (isConfirm) {
                                            r.uploadFileList = file;
                                            r.apiMiddleware.upload(r.uploadFileList, r.fileNavigator.currentPath, true).then(function (e) {
                                                var n = e.result && e.result.error || r.translateFilter('error_uploading_files');
                                                r.apiMiddleware.apiHandler.error = n;
                                                r.fileNavigator.refresh(), r.uploadFileList = [], r.modal("uploadfile", !0);
                                            });
                                        }
                                        else {
                                            return null;
                                        }
                                    });
                            }
                            r.fileNavigator.refresh(), r.uploadFileList = [], r.modal("uploadfile", !0);
                        }, function (e) {
                            var n = e.result && e.result.error || a('translate')("error_uploading_files");
                            r.apiMiddleware.apiHandler.error = n;
                        });
                    }, r.cleanup = function () {
                        var dt = {
                            action: "cleanup",
                            path: '/' + (n.selectedModalPath).join('/')
                        };
                        r.fileNavigator.cleanupLoader();
                        h.post(fm.cleanupUrl, dt).then(function (o) {
                            r.fileNavigator.refresh(r.currentPageIndex, r.itemsPerPage);
                            console.log("response", o.data);
                        });
                    };
                r.getUrl = function (e) {
                    return r.apiMiddleware.getUrl(e);
                };
                var c = function (e) {
                    var r = n.selectedModalPath.join("");
                    return (e && e.model.path.join("")) === r;
                },
                    p = function (e) {
                        var r = i.location.search.substr(1).split("&").filter(function (r) {
                            return e === r.split("=")[0];
                        });
                        return r[0] && r[0].split("=")[1] || void 0;
                    };
                r.isWindows = "Windows" === p("server"), r.fileNavigator.refresh(r.currentPageIndex, r.itemsPerPage);
            }]);
    }(angular),
    function (e) {
        "use strict";
        angular.module("eServices").controller("ModalFileManagerCtrl", ["$scope", "$rootScope", "fileNavigator", function (e, r, n) {
            e.reverse = !1, e.predicate = ["model.type", "model.name"], e.fileNavigator = new n, r.selectedModalPath = [], e.order = function (r) {
                e.reverse = e.predicate[1] === r && !e.reverse, e.predicate[1] = r;
            }, e.select = function (n) {
                r.selectedModalPath = n.model.fullPath().split("/").filter(Boolean), e.modal("selector", !0);
            }, e.selectCurrent = function () {
                r.selectedModalPath = e.fileNavigator.currentPath, e.modal("selector", !0);
            }, e.selectedFilesAreChildOfPath = function (r) {
                var n = r.model.fullPath();
                return e.temps.find(function (e) {
                    var r = e.model.fullPath();
                    if (n == r) return !0;
                });
            }, r.openNavigator = function (r) {
                e.fileNavigator.currentPath = r, e.fileNavigator.refresh(), e.modal("selector");
            }, r.getSelectedPath = function () {
                var n = "/" + r.selectedModalPath.filter(Boolean).join("/");
                return e.singleSelection() && !e.singleSelection().isFolder() && (n += "/" + e.singleSelection().tempModel.name), n.replace(/\/\//, "/")
            };
        }]);
    }(),
    function (e) {
        "use strict";
        angular.module("eServices").service("chmod", function () {
            var e = function (e) {
                if (this.owner = this.getRwxObj(), this.group = this.getRwxObj(), this.others = this.getRwxObj(), e) {
                    var r = isNaN(e) ? this.convertfromCode(e) : this.convertfromOctal(e);
                    if (!r) throw new Error("Invalid chmod input data (%s)".replace("%s", e));
                    this.owner = r.owner, this.group = r.group, this.others = r.others;
                }
            };
            return e.prototype.toOctal = function (e, r) {
                var n = [];
                return ["owner", "group", "others"].forEach(function (e, r) {
                    n[r] = this[e].read && this.octalValues.read || 0, n[r] += this[e].write && this.octalValues.write || 0, n[r] += this[e].exec && this.octalValues.exec || 0
                }.bind(this)), (e || "") + n.join("") + (r || "");
            }, e.prototype.toCode = function (e, r) {
                var n = [];
                return ["owner", "group", "others"].forEach(function (e, r) {
                    n[r] = this[e].read && this.codeValues.read || "-", n[r] += this[e].write && this.codeValues.write || "-", n[r] += this[e].exec && this.codeValues.exec || "-"
                }.bind(this)), (e || "") + n.join("") + (r || "");
            }, e.prototype.getRwxObj = function () {
                return {
                    read: !1,
                    write: !1,
                    exec: !1
                };
            }, e.prototype.octalValues = {
                read: 4,
                write: 2,
                exec: 1
            }, e.prototype.codeValues = {
                read: "r",
                write: "w",
                exec: "x"
            }, e.prototype.convertfromCode = function (e) {
                if (e = ("" + e).replace(/\s/g, ""), e = 10 === e.length ? e.substr(1) : e, /^[-rwxts]{9}$/.test(e)) {
                    var r = [],
                        n = e.match(/.{1,3}/g);
                    for (var i in n) {
                        var a = this.getRwxObj();
                        a.read = /r/.test(n[i]), a.write = /w/.test(n[i]), a.exec = /x|t/.test(n[i]), r.push(a);
                    }
                    return {
                        owner: r[0],
                        group: r[1],
                        others: r[2]
                    };
                }
            }, e.prototype.convertfromOctal = function (e) {
                if (e = ("" + e).replace(/\s/g, ""), e = 4 === e.length ? e.substr(1) : e, /^[0-7]{3}$/.test(e)) {
                    var r = [],
                        n = e.match(/.{1}/g);
                    for (var i in n) {
                        var a = this.getRwxObj();
                        a.read = /[4567]/.test(n[i]), a.write = /[2367]/.test(n[i]), a.exec = /[1357]/.test(n[i]), r.push(a)
                    }
                    return {
                        owner: r[0],
                        group: r[1],
                        others: r[2]
                    };
                }
            }, e;
        });
    }(),
    function (e) {
        "use strict";
        e.module("eServices").factory("item", ["fileManagerConfig", "chmod", function (r, n) {
            var i = function (r, i) {
                var a = {
                    name: r && r.name || "",
                    path: i || [],
                    type: r && r.type || "file",
                    size: r && parseInt(r.size || 0),
                    date: function (e) {
                        var r = (e || "").toString().split(/[- :]/);
                        return new Date(r[0], r[1] - 1, r[2], r[3], r[4], r[5]);
                    }(r && r.date),
                    perms: new n(r && r.rights),
                    content: r && r.content || "",
                    recursive: !1,
                    fullPath: function () {
                        return ("/" + this.path.filter(Boolean).join("/") + "/" + this.name).replace(/\/\//, "/");
                    }
                };
                this.error = "", this.processing = !1, this.model = e.copy(a), this.tempModel = e.copy(a);
            };
            return i.prototype.update = function () {
                e.extend(this.model, e.copy(this.tempModel));
            }, i.prototype.revert = function () {
                e.extend(this.tempModel, e.copy(this.model)), this.error = "";
            }, i.prototype.isFolder = function () {
                return "dir" === this.model.type;
            }, i.prototype.isEditable = function () {
                return !this.isFolder() && r.isEditableFilePattern.test(this.model.name);
            }, i.prototype.isImage = function () {
                return r.isImageFilePattern.test(this.model.name);
            }, i.prototype.isCompressible = function () {
                return this.isFolder();
            }, i.prototype.isExtractable = function () {
                return !this.isFolder() && r.isExtractableFilePattern.test(this.model.name);
            }, i.prototype.isSelectable = function () {
                return this.isFolder() && r.allowedActions.pickFolders || !this.isFolder() && r.allowedActions.pickFiles;
            }, i;
        }]);
    }(angular),
    function (e) {
        "use strict";
        var r = angular.module("eServices");
        r.directive("angularFilemanager", ["$parse", "fileManagerConfig", function (e, r) {
            return {
                restrict: "EA",
                templateUrl: r.tplPath + "/main.html"
            };
        }]), r.directive("ngFile", ["$parse", function (e) {
            return {
                restrict: "A",
                link: function (r, n, i) {
                    var a = e(i.ngFile).assign;
                    n.bind("change", function () {
                        r.$apply(function () {
                            a(r, n[0].files);
                        });
                    });
                }
            };
        }]), r.directive("ngRightClick", ["$parse", function (e) {
            return function (r, n, i) {
                var a = e(i.ngRightClick);
                n.bind("contextmenu", function (e) {
                    r.$apply(function () {
                        e.preventDefault(), a(r, {
                            $event: e
                        });
                    });
                });
            };
        }]);
    }(),
    function (e) {
        "use strict";
        var r = angular.module("eServices");
        r.filter("strLimit", ["$filter", function (e) {
            return function (r, n, i) {
                return r.length <= n ? r : e("limitTo")(r, n) + (i || "...");
            };
        }]), r.filter("fileExtension", ["$filter", function (e) {
            return function (r) {
                return /\./.test(r) && e("strLimit")(r.split(".").pop(), 3, "..") || "";
            };
        }]), r.filter("formatDate", ["$filter", function () {
            return function (e) {
                return e instanceof Date ? e.toISOString().substring(0, 19).replace("T", " ") : (e.toLocaleString || e.toString).apply(e);
            };
        }]), r.filter("humanReadableFileSize", ["$filter", "fileManagerConfig", function (e, r) {
            var n = [" kB", " MB", " GB", " TB", "PB", "EB", "ZB", "YB"],
                i = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
            return function (e) {
                var a = -1,
                    t = e;
                do {
                    t /= 1024, a++;
                } while (t > 1024);
                var o = r.useBinarySizePrefixes ? i[a] : n[a];
                return Math.max(t, .1).toFixed(1) + " " + o;
            };
        }]);
    }(),
    function (e) {
        "use strict";
        e.module("eServices").provider("fileManagerConfig", function () {
            var urlPrefix = "http://localhost:1113/";
            var r = {
                appName: "angular-filemanager v1.5",
                defaultLang: "en",
                multiLang: !0,
                listUrl: urlPrefix + "api/FileManager/GetList",
                uploadUrl: urlPrefix + "api/FileManager/UploadFile",
                renameUrl: urlPrefix + "api/FileManager/Rename",
                copyUrl: urlPrefix + "api/FileManager/Copy",
                moveUrl: urlPrefix + "api/FileManager/Move",
                removeUrl: urlPrefix + "api/FileManager/Remove",
                editUrl: urlPrefix + "api/FileManager/Edit",
                getContentUrl: urlPrefix + "api/FileManager/GetContent",
                createFolderUrl: urlPrefix + "api/FileManager/CreateFolder",
                downloadFileUrl: urlPrefix + "api/FileManager/Download",
                downloadMultipleUrl: urlPrefix + "api/FileManager/MultipleDownload",
                compressUrl: urlPrefix + "api/FileManager/Compress",
                extractUrl: urlPrefix + "api/FileManager/Extract",
                permissionsUrl: urlPrefix + "api/FileManager/ChangePermissions",
                cleanupUrl: urlPrefix + "api/FileManager/CleanupFile",
                totalRecordCount: urlPrefix + "api/FileManager/GetTotalRecordCount",
                basePath: "/",
                searchForm: !0,
                sidebarFM: !0,
                breadcrumb: !0,
                allowedActions: {
                    upload: !0,
                    rename: !0,
                    move: !0,
                    copy: !0,
                    edit: !0,
                    changePermissions: !0,
                    compress: !0,
                    compressChooseName: !0,
                    extract: !0,
                    download: !0,
                    downloadMultiple: !0,
                    preview: !0,
                    remove: !0,
                    createFolder: !0,
                    pickFiles: !1,
                    pickFolders: !1,
                    cleanup: !0
                },
                multipleDownloadFileName: "angular-filemanager.zip",
                filterFileExtensions: [],
                showExtensionIcons: !0,
                showSizeForDirectories: !1,
                useBinarySizePrefixes: !1,
                downloadFilesByAjax: !0,
                previewImagesInModal: !0,
                enablePermissionsRecursive: !0,
                compressAsync: !1,
                extractAsync: !1,
                pickCallback: null,
                isEditableFilePattern: /\.(txt|diff?|patch|svg|asc|cnf|cfg|conf|html?|.html|cfm|cgi|aspx?|ini|pl|py|md|css|cs|js|jsp|log|htaccess|htpasswd|gitignore|gitattributes|env|json|atom|eml|rss|markdown|sql|xml|xslt?|sh|rb|as|bat|cmd|cob|for|ftn|frm|frx|inc|lisp|scm|coffee|php[3-6]?|java|c|cbl|go|h|scala|vb|tmpl|lock|go|yml|yaml|tsv|lst)$/i,
                isImageFilePattern: /\.(jpe?g|gif|bmp|png|svg|tiff?)$/i,
                isExtractableFilePattern: /\.(gz|tar|rar|g?zip)$/i,
                tplPath: "src/templates"
            };
            return {
                $get: function () {
                    return r;
                },
                set: function (n) {
                    e.extend(r, n);
                }
            };
        });
    }(angular),
    function (e) {
        "use strict";
        angular.module("eServices").service("apiHandler", ["$http", "$q", "$window", "$filter", "$httpParamSerializer", "Upload", function (e, r, n, i, a, t) {
            e.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
            var o = function () {
                this.inprocess = !1, this.asyncSuccess = !1, this.error = "";
            };
            return o.prototype.deferredHandler = function (e, r, n, i) {
                return e && "object" == typeof e || (this.error = "Error %s - Bridge response error, please check the API docs or this ajax response.".replace("%s", n)), 404 == n && (this.error = "Error 404 - Backend bridge is not working, please check the ajax response."), e.result && e.result.error && (this.error = e.result.error), !this.error && e.error && (this.error = e.error.message), !this.error && i && (this.error = i), this.error ? r.reject(e) : r.resolve(e)
            }, o.prototype.list = function (n, i, a, t, pgIndex, pgCount) {
                var o = this,
                    s = a || o.deferredHandler,
                    l = r.defer(),
                    d = {
                        action: "list",
                        path: i,
                        pageIndex: pgIndex ? pgIndex : 1,
                        pageCount: pgCount ? pgCount : 10,
                        fileExtensions: t && t.length ? t : void 0
                    };
                return o.inprocess = !0, o.error = "", e.post(n, d).then(function (e) {
                    s(e.data, l, e.status);
                }, function (e) {
                    s(e.data, l, e.status, "Unknown error listing, check the response");
                }).finally(function () {
                    o.inprocess = !1;
                }), l.promise;
            }, o.prototype.copy = function (n, a, t, o) {
                var s = this,
                    l = r.defer(),
                    d = {
                        action: "copy",
                        items: a,
                        newPath: t
                    };
                return o && 1 === a.length && (d.singleFilename = o), s.inprocess = !0, s.error = "", e.post(n, d).then(function (e) {
                    s.deferredHandler(e.data, l, e.status);
                }, function (e) {
                    s.deferredHandler(e.data, l, e.status, i('translate')("error_copying"));
                }).finally(function () {
                    s.inprocess = !1;
                }), l.promise;
            }, o.prototype.move = function (n, a, t) {
                var o = this,
                    s = r.defer(),
                    l = {
                        action: "move",
                        items: a,
                        newPath: t
                    };
                return o.inprocess = !0, o.error = "", e.post(n, l).then(function (e) {
                    o.deferredHandler(e.data, s, e.status);
                }, function (e) {
                    o.deferredHandler(e.data, s, e.status, i('translate')("error_moving"));
                }).finally(function () {
                    o.inprocess = !1;
                }), s.promise;
            }, o.prototype.remove = function (n, a) {
                var t = this,
                    o = r.defer(),
                    s = {
                        action: "remove",
                        items: a
                    };
                return t.inprocess = !0, t.error = "", e.post(n, s).then(function (e) {
                    t.deferredHandler(e.data, o, e.status);
                }, function (e) {
                    t.deferredHandler(e.data, o, e.status, i('translate')("error_deleting"));
                }).finally(function () {
                    t.inprocess = !1;
                }), o.promise;
            }, o.prototype.upload = function (e, n, i, ov) {
                var a = this,
                    o = r.defer();
                a.inprocess = !0, a.progress = 0, a.error = "";
                for (var s = {
                    destination: n
                }, l = 0; l < i.length; l++) s["file-" + l] = i[l];
                return i && i.length && t.upload({
                    url: e + "?destination=" + n + "&is_Override=" + ov,
                    data: s
                }).then(function (e) {
                    a.deferredHandler(e.data, o, e.status)
                }, function (e) {
                    a.deferredHandler(e.data, o, e.status, "Unknown error uploading files");
                }, function (e) {
                    a.progress = Math.min(100, parseInt(100 * e.loaded / e.total)) - 1;
                }).finally(function () {
                    a.inprocess = !1, a.progress = 0;
                }), o.promise;
            }, o.prototype.getContent = function (n, a) {
                var t = this,
                    o = r.defer(),
                    s = {
                        action: "getContent",
                        item: a
                    };
                return t.inprocess = !0, t.error = "", e.post(n, s).then(function (e) {
                    t.deferredHandler(e.data, o, e.status);
                }, function (e) {
                    t.deferredHandler(e.data, o, e.status, i('translate')("error_getting_content"));
                }).finally(function () {
                    t.inprocess = !1;
                }), o.promise;
            }, o.prototype.edit = function (n, a, t) {
                var o = this,
                    s = r.defer(),
                    l = {
                        action: "edit",
                        item: a,
                        content: t
                    };
                return o.inprocess = !0, o.error = "", e.post(n, l).then(function (e) {
                    o.deferredHandler(e.data, s, e.status);
                }, function (e) {
                    o.deferredHandler(e.data, s, e.status, i('translate')("error_modifying"));
                }).finally(function () {
                    o.inprocess = !1;
                }), s.promise;
            }, o.prototype.rename = function (n, a, t) {
                var o = this,
                    s = r.defer(),
                    l = {
                        action: "rename",
                        item: a,
                        newItemPath: t
                    };
                return o.inprocess = !0, o.error = "", e.post(n, l).then(function (e) {
                    o.deferredHandler(e.data, s, e.status);
                }, function (e) {
                    o.deferredHandler(e.data, s, e.status, i('translate')("error_renaming"));
                }).finally(function () {
                    o.inprocess = !1;
                }), s.promise;
            }, o.prototype.getUrl = function (e, r) {
                return r && [e, a({
                    action: "download",
                    path: r
                })].join("?");
            }, o.prototype.download = function (a, t, fn) {
                e({
                    method: "GET",
                    cache: !1,
                    url: "http://localhost:1113/api/FileManager/Download?path=" + t,
                    responseType: "arraybuffer",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    }
                }).success(function (o, e, t) {
                    var n = "application/octet-stream",
                        l = !1,
                        i = (t = t())["x-filename"] || fn,
                        a = t["content-type"] || n;
                    try {
                        var c = new Blob([o], {
                            type: a
                        });
                        if (navigator.msSaveBlob) navigator.msSaveBlob(c, i);
                        else {
                            var d = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
                            if (void 0 === d) throw "Not supported";
                            d(c, i);
                        }
                        l = !0;
                    } catch (o) {
                        console.log("saveBlob method failed with the following exception:"), console.log(o);
                    }
                    if (!l) {
                        var s = window.URL || window.webkitURL || window.mozURL || window.msURL;
                        if (s) {
                            var w = document.createElement("a");
                            if ("download" in w) try {
                                c = new Blob([o], {
                                    type: a
                                });
                                var r = s.createObjectURL(c);
                                w.setAttribute("href", r), w.setAttribute("download", i);
                                var h = document.createEvent("MouseEvents");
                                h.initMouseEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 0, null), w.dispatchEvent(h), l = !0;
                            } catch (o) {
                                console.log("Download link method with simulated click failed with the following exception:"), console.log(o);
                            }
                            if (!l) try {
                                c = new Blob([o], {
                                    type: n
                                }), r = s.createObjectURL(c), window.location = r, l = !0;
                            } catch (o) {
                                console.log("Download link method with window.location failed with the following exception:"), console.log(o);
                            }
                        }
                    }
                    l || (window.open(httpPath, "_blank", ""));
                }).error(function (o, e) {
                    console.log("Request failed with status: " + e);
                });
            }, o.prototype.downloadMultiple = function (t, o, s, l, d) {
                var c = this,
                    p = r.defer(),
                    m = [t, a({
                        action: "downloadMultiple",
                        items: o,
                        toFilename: s
                    })].join("?");
                return l && !d && n.saveAs ? (c.inprocess = !0, e.post(t, {
                    action: "downloadMultiple",
                    items: o,
                    toFilename: s
                }).then(function (e) {
                    var r = new n.Blob([e.data]);
                    p.resolve(e.data), n.saveAs(r, s);
                }, function (e) {
                    c.deferredHandler(e.data, p, e.status, i('translate')("error_downloading"));
                }).finally(function () {
                    c.inprocess = !1;
                }), p.promise) : (!n.saveAs && n.console.log("Your browser dont support ajax download, downloading by default"), !!n.open(m, "_blank", ""))
            }, o.prototype.compress = function (n, a, t, o) {
                var s = this,
                    l = r.defer(),
                    d = {
                        action: "compress",
                        items: a,
                        destination: o,
                        compressedFilename: t
                    };
                return s.inprocess = !0, s.error = "", e.post(n, d).then(function (e) {
                    s.deferredHandler(e.data, l, e.status);
                }, function (e) {
                    s.deferredHandler(e.data, l, e.status, i('translate')("error_compressing"));
                }).finally(function () {
                    s.inprocess = !1;
                }), l.promise;
            }, o.prototype.extract = function (n, a, t, o) {
                var s = this,
                    l = r.defer(),
                    d = {
                        action: "extract",
                        item: a,
                        destination: o,
                        folderName: t
                    };
                return s.inprocess = !0, s.error = "", e.post(n, d).then(function (e) {
                    s.deferredHandler(e.data, l, e.status);
                }, function (e) {
                    s.deferredHandler(e.data, l, e.status, i('translate')("error_extracting"));
                }).finally(function () {
                    s.inprocess = !1;
                }), l.promise;
            }, o.prototype.changePermissions = function (n, a, t, o, s) {
                var l = this,
                    d = r.defer(),
                    c = {
                        action: "changePermissions",
                        items: a,
                        perms: t,
                        permsCode: o,
                        recursive: !!s
                    };
                return l.inprocess = !0, l.error = "", e.post(n, c).then(function (e) {
                    l.deferredHandler(e.data, d, e.status);
                }, function (e) {
                    l.deferredHandler(e.data, d, e.status, i('translate')("error_changing_perms"));
                }).finally(function () {
                    l.inprocess = !1;
                }), d.promise;
            }, o.prototype.createFolder = function (n, a) {
                var t = this,
                    o = r.defer(),
                    s = {
                        action: "createFolder",
                        newPath: a
                    };
                return t.inprocess = !0, t.error = "", e.post(n, s).then(function (e) {
                    t.deferredHandler(e.data, o, e.status);
                }, function (e) {
                    t.deferredHandler(e.data, o, e.status, i('translate')("error_creating_folder"));
                }).finally(function () {
                    t.inprocess = !1;
                }), o.promise;
            }, o;
        }]);
    }(),
    function (e) {
        "use strict";
        angular.module("eServices").service("apiMiddleware", ["$window", "fileManagerConfig", "apiHandler", function (e, r, n, pgIndex, pgCount) {
            var i = function () {
                this.apiHandler = new n;
            };
            return i.prototype.getPath = function (e) {
                return "/" + e.join("/");
            }, i.prototype.getFileList = function (e) {
                return (e || []).map(function (e) {
                    return e && e.model.fullPath();
                });
            }, i.prototype.getFilePath = function (e) {
                return e && e.model.fullPath();
            }, i.prototype.list = function (e, n, pgIndex, pgCount) {
                return this.apiHandler.list(r.listUrl, this.getPath(e), n, 0, pgIndex, pgCount);
            }, i.prototype.copy = function (e, n) {
                var i = this.getFileList(e),
                    a = 1 === i.length ? e[0].tempModel.name : void 0;
                return this.apiHandler.copy(r.copyUrl, i, this.getPath(n), a);
            }, i.prototype.move = function (e, n) {
                var i = this.getFileList(e);
                return this.apiHandler.move(r.moveUrl, i, this.getPath(n));
            }, i.prototype.remove = function (e) {
                var n = this.getFileList(e);
                return this.apiHandler.remove(r.removeUrl, n);
            }, i.prototype.upload = function (n, i, ov = false) {
                if (!e.FormData) throw new Error("Unsupported browser version");
                var a = this.getPath(i);
                return this.apiHandler.upload(r.uploadUrl, a, n, ov);
            }, i.prototype.getContent = function (e) {
                var n = this.getFilePath(e);
                return this.apiHandler.getContent(r.getContentUrl, n);
            }, i.prototype.edit = function (e) {
                var n = this.getFilePath(e);
                return this.apiHandler.edit(r.editUrl, n, e.tempModel.content);
            }, i.prototype.rename = function (e) {
                var n = this.getFilePath(e),
                    i = e.tempModel.fullPath();
                return this.apiHandler.rename(r.renameUrl, n, i);
            }, i.prototype.getUrl = function (e) {
                var n = this.getFilePath(e);
                return this.apiHandler.getUrl(r.downloadFileUrl, n);
            }, i.prototype.download = function (e, n) {
                var i = this.getFilePath(e),
                    a = e.model.name;
                if (!e.isFolder()) return this.apiHandler.download(r.downloadFileUrl, i, a, r.downloadFilesByAjax, n);
            }, i.prototype.downloadMultiple = function (e, n) {
                var i = this.getFileList(e),
                    a = (new Date).getTime().toString().substr(8, 13) + "-" + r.multipleDownloadFileName;
                return this.apiHandler.downloadMultiple(r.downloadMultipleUrl, i, a, r.downloadFilesByAjax, n);
            }, i.prototype.compress = function (e, n, i) {
                var a = this.getFileList(e);
                return this.apiHandler.compress(r.compressUrl, a, n, this.getPath(i));
            }, i.prototype.extract = function (e, n, i) {
                var a = this.getFilePath(e);
                return this.apiHandler.extract(r.extractUrl, a, n, this.getPath(i));
            }, i.prototype.changePermissions = function (e, n) {
                var i = this.getFileList(e),
                    a = n.tempModel.perms.toCode(),
                    t = n.tempModel.perms.toOctal(),
                    o = !!n.tempModel.recursive;
                return this.apiHandler.changePermissions(r.permissionsUrl, i, a, t, o);
            }, i.prototype.createFolder = function (e) {
                var n = e.tempModel.fullPath();
                return this.apiHandler.createFolder(r.createFolderUrl, n);
            }, i;
        }]);
    }(),
    function (e) {
        "use strict";
        angular.module("eServices").service("fileNavigator", ["apiMiddleware", "fileManagerConfig", "item", function (e, r, n) {
            var i = function () {
                this.apiMiddleware = new e, this.requesting = !1, this.fileList = [], this.currentPath = this.getBasePath(), this.history = [], this.error = "", this.onRefresh = function () { };
            };
            return i.prototype.getBasePath = function () {
                var e = (r.basePath || "").replace(/^\//, "");
                return e.trim() ? e.split("/") : [];
            }, i.prototype.deferredHandler = function (e, r, n, i) {
                return e && "object" == typeof e || (this.error = "Error %s - Bridge response error, please check the API docs or this ajax response.".replace("%s", n)), 404 == n && (this.error = "Error 404 - Backend bridge is not working, please check the ajax response."), 200 == n && (this.error = null), !this.error && e.result && e.result.error && (this.error = e.result.error), !this.error && e.error && (this.error = e.error.message), !this.error && i && (this.error = i), this.error ? r.reject(e) : r.resolve(e)
            }, i.prototype.list = function (pgIndex, pgCount) {
                return this.apiMiddleware.list(this.currentPath, this.deferredHandler.bind(this), pgIndex, pgCount);
            }, i.prototype.cleanupLoader = function () {
                var e = this;
                e.requesting = !0;
            }, i.prototype.refresh = function (pgIndex, pgCount) {
                var e = this;
                e.currentPath.length || (e.currentPath = this.getBasePath());
                var r = e.currentPath.join("/");
                return e.requesting = !0, e.fileList = [], e.list(pgIndex, pgCount).then(function (i) {
                    e.fileList = (i.result || []).map(function (r) {
                        return new n(r, e.currentPath);
                    }), e.buildTree(r), e.onRefresh();
                }).finally(function () {
                    e.requesting = !1;
                });
            }, i.prototype.buildTree = function (e) {
                function r(e, n, i) {
                    var a = i ? i + "/" + n.model.name : n.model.name;
                    if (e.name && e.name.trim() && 0 !== i.trim().indexOf(e.name) && (e.nodes = []), e.name !== i) e.nodes.forEach(function (e) {
                        r(e, n, i);
                    });
                    else {
                        for (var t in e.nodes)
                            if (e.nodes[t].name === a) return;
                        e.nodes.push({
                            item: n,
                            name: a,
                            nodes: []
                        });
                    }
                    e.nodes = e.nodes.sort(function (e, r) {
                        return e.name.toLowerCase() < r.name.toLowerCase() ? -1 : e.name.toLowerCase() === r.name.toLowerCase() ? 0 : 1
                    });
                }
                function i(e, r) {
                    r.push(e);
                    for (var n in e.nodes) i(e.nodes[n], r);
                }
                var a = [],
                    t = {};
                !this.history.length && this.history.push({
                    name: this.getBasePath()[0] || "",
                    nodes: []
                }), i(this.history[0], a), (t = function (e, r) {
                    return e.filter(function (e) {
                        return e.name === r;
                    })[0];
                }(a, e)) && (t.nodes = []);
                for (var o in this.fileList) {
                    var s = this.fileList[o];
                    s instanceof n && s.isFolder() && r(this.history[0], s, e);
                }
            }, i.prototype.folderClick = function (e) {
                this.currentPath = [], e && e.isFolder() && (this.currentPath = e.model.fullPath().split("/").splice(1)), this.refresh()
            }, i.prototype.upDir = function () {
                this.currentPath[0] && (this.currentPath = this.currentPath.slice(0, -1), this.refresh());
            }, i.prototype.goTo = function (e) {
                this.currentPath = this.currentPath.slice(0, e + 1), this.refresh();
            }, i.prototype.fileNameExists = function (e) {
                return this.fileList.find(function (r) {
                    return e && r.model.name.trim() === e.trim();
                });
            }, i.prototype.listHasFolders = function () {
                return this.fileList.find(function (e) {
                    return "dir" === e.model.type;
                });
            }, i.prototype.getCurrentFolderName = function () {
                return this.currentPath.slice(-1)[0] || "/";
            }, i;
        }]);
    }(), angular.module("eServices").run(["$templateCache", function (e) {
    e.put("src/templates/current-folder-breadcrumb.html", '<ol class="breadcrumbFM">\r\n    <li>\r\n        <a href="" ng-click="fileNavigator.goTo(-1)">\r\n            {{"systemManagement.fileManager" | translate}}\r\n        </a>\r\n    </li>\r\n    <li ng-repeat="(key, dir) in fileNavigator.currentPath track by key" ng-class="{\'active\':$last}" class="animatedFM fast fadeIn">\r\n       <span> > </span> <a href="" ng-show="!$last" ng-click="fileNavigator.goTo(key)">\r\n            {{dir | strLimit : 30}}\r\n        </a>\r\n        <span ng-show="$last">\r\n            {{dir | strLimit : 30}}\r\n        </span>\r\n    </li>\r\n</ol>'), e.put("src/templates/item-context-menu.html", '<div id="context-menu" class="dropdown clearfix animatedFM fast fadeIn">\r\n    <ul class="dropdown-menu dropdown-right-click" role="menu" aria-labelledby="dropdownMenu" ng-show="temps.length">\r\n\r\n        <li ng-show="singleSelection() && singleSelection().isFolder()">\r\n            <a href="" tabindex="-1" ng-click="smartClick(singleSelection())">\r\n                <i class="glyphiconFM glyphicon-folder-open"></i> {{\'systemManagement.open\' | translate}}\r\n            </a>\r\n        </li>\r\n\r\n        <li ng-show="config.pickCallback && singleSelection() && singleSelection().isSelectable()">\r\n            <a href="" tabindex="-1" ng-click="config.pickCallback(singleSelection().model)">\r\n                <i class="glyphiconFM glyphicon-hand-up"></i> {{\'systemManagement.select_this\' | translate}}\r\n            </a>\r\n        </li>\r\n\r\n        <li ng-show="config.allowedActions.download && !selectionHas(\'dir\') && singleSelection()">\r\n         <a href="" type="submit" tabindex="-1" ng-click="download()">\r\n                <i class="glyphiconFM glyphicon-cloud-download"></i> {{\'systemManagement.download\' | translate}}\r\n            </a>\r\n        </li>\r\n\r\n        <li ng-show="config.allowedActions.downloadMultiple && !selectionHas(\'dir\') && !singleSelection()">\r\n            <a href="" tabindex="-1" ng-click="download()">\r\n                <i class="glyphiconFM glyphicon-cloud-download"></i> {{\'systemManagement.download_as_zip\' | translate}}\r\n            </a>\r\n        </li>\r\n\r\n        <li ng-show="config.allowedActions.preview && singleSelection().isImage() && singleSelection()">\r\n            <a href="" tabindex="-1" ng-click="openImagePreview()">\r\n                <i class="glyphiconFM glyphicon-picture"></i> {{\'systemManagement.view_item\' | translate}}\r\n            </a>\r\n        </li>\r\n\r\n        <li ng-show="config.allowedActions.rename && singleSelection()">\r\n            <a href="" tabindex="-1" ng-click="modal(\'rename\')">\r\n                <i class="glyphiconFM glyphicon-edit"></i> {{\'systemManagement.rename\' | translate}}\r\n            </a>\r\n        </li>\r\n\r\n        <li ng-show="config.allowedActions.move">\r\n            <a href="" tabindex="-1" ng-click="modalWithPathSelector(\'move\')">\r\n                <i class="glyphiconFM glyphicon-arrow-right"></i> {{\'systemManagement.move\' | translate}}\r\n            </a>\r\n        </li>\r\n\r\n        <li ng-show="config.allowedActions.copy && !selectionHas(\'dir\')">\r\n            <a href="" tabindex="-1" ng-click="modalWithPathSelector(\'copy\')">\r\n                <i class="glyphiconFM glyphicon-log-out"></i> {{\'systemManagement.copy\' | translate}}\r\n            </a>\r\n        </li>\r\n\r\n        <li ng-show="config.allowedActions.edit && singleSelection() && singleSelection().isEditable()">\r\n            <a href="" tabindex="-1" ng-click="openEditItem()">\r\n                <i class="glyphiconFM glyphicon-pencil"></i> {{\'systemManagement.edit\' | translate}}\r\n            </a>\r\n        </li>\r\n\r\n        <li ng-show="config.allowedActions.changePermissions">\r\n            <a href="" tabindex="-1" ng-click="modal(\'changepermissions\')">\r\n                <i class="glyphiconFM glyphicon-lock"></i> {{\'systemManagement.permissions\' | translate}}\r\n            </a>\r\n        </li>\r\n\r\n        <li ng-show="config.allowedActions.compress && (!singleSelection() || selectionHas(\'dir\'))">\r\n            <a href="" tabindex="-1" ng-click="modal(\'compress\')">\r\n                <i class="glyphiconFM glyphicon-compressed"></i> {{\'systemManagement.compress\' | translate}}\r\n            </a>\r\n        </li>\r\n\r\n        <li ng-show="config.allowedActions.extract && singleSelection() && singleSelection().isExtractable()">\r\n            <a href="" tabindex="-1" ng-click="modal(\'extract\')">\r\n                <i class="glyphiconFM glyphicon-export"></i> {{\'systemManagement.extract\' | translate}}\r\n            </a>\r\n        </li>\r\n\r\n        <li class="divider" ng-show="config.allowedActions.remove"></li>\r\n        \r\n        <li ng-show="config.allowedActions.remove">\r\n            <a href="" tabindex="-1" ng-click="modal(\'remove\')">\r\n                <i class="glyphiconFM glyphicon-trash"></i> {{\'systemManagement.remove\' | translate}}\r\n            </a>\r\n        </li>\r\n\r\n    </ul>\r\n\r\n    <ul class="dropdown-menu dropdown-right-click" role="menu" aria-labelledby="dropdownMenu" ng-show="!temps.length">\r\n        <li ng-show="config.allowedActions.createFolder">\r\n            <a href="" tabindex="-1" ng-click="modal(\'newfolder\') && prepareNewFolder()">\r\n                <i class="glyphiconFM glyphicon-plus"></i> {{\'systemManagement.new_folder\' | translate}}\r\n            </a>\r\n        </li>\r\n        <li ng-show="config.allowedActions.upload">\r\n            <a href="" tabindex="-1" ng-click="modal(\'uploadfile\')">\r\n                <i class="glyphiconFM glyphicon-cloud-upload"></i> {{\'systemManagement.upload_files\' | translate}}\r\n            </a>\r\n        </li>\r\n    </ul>\r\n</div>'), e.put("src/templates/main-icons.html", '<div class="iconsetFM noselect" style="float:right !important">\r\n    <div class="item-list clearfix" ng-click="selectOrUnselect(null, $event)" ng-right-click="selectOrUnselect(null, $event)" prevent="true">\r\n        <div class="col-120FM" ng-repeat="item in $parent.fileList = (fileNavigator.fileList | filter: {model:{name: query}})" ng-show="!fileNavigator.requesting && !fileNavigator.error">\r\n            <a href="" class="thumbnail text-center" ng-click="selectOrUnselect(item, $event)" ng-dblclick="smartClick(item)" ng-right-click="selectOrUnselect(item, $event)" title="{{item.model.name}} ({{item.model.size | humanReadableFileSize}})" ng-class="{selectedFM: isSelected(item)}">\r\n                <div class="item-icon">\r\n                    <i class="glyphiconFM glyphicon-folder-open" ng-show="item.model.type === \'dir\'"></i>\r\n                    <i class="glyphiconFM glyphicon-file" data-ext="{{ item.model.name | fileExtension }}" ng-show="item.model.type === \'file\'" ng-class="{\'item-extension\': config.showExtensionIcons}"></i>\r\n                </div>\r\n                {{item.model.name | strLimit : 11 }}\r\n            </a>\r\n        </div>\r\n    </div>\r\n\r\n    <div ng-show="fileNavigator.requesting">\r\n        <div ng-include="config.tplPath + \'/spinner.html\'"></div>\r\n    </div>\r\n\r\n    <div class="alert" ng-show="!fileNavigator.requesting && fileNavigator.fileList.length < 1 && !fileNavigator.error">\r\n        {{"systemManagement.no_files_in_folder" | translate}}...\r\n    </div>\r\n    \r\n    <div class="alert alert-danger" ng-show="!fileNavigator.requesting && fileNavigator.error">\r\n        {{ fileNavigator.error }}\r\n    </div>\r\n</div>'), e.put("src/templates/main-table-modal.html", '<table class="tableFM table-condensed table-modal-condensed mb0FM">\r\n    <thead>\r\n        <tr>\r\n            <th>\r\n                <a href="" ng-click="order(\'model.name\')">\r\n                    {{"systemManagement.Name" | translate}}\r\n                    <span class="sortorder" ng-show="predicate[1] === \'model.name\'" ng-class="{reverse:reverse}"></span>\r\n                </a>\r\n            </th>\r\n            <th class="text-right"></th>\r\n        </tr>\r\n    </thead>\r\n    <tbody class="file-item">\r\n        <tr ng-show="fileNavigator.requesting">\r\n            <td colspan="2">\r\n                <div ng-include="config.tplPath + \'/spinner.html\'"></div>\r\n            </td>\r\n        </tr>\r\n        <tr ng-show="!fileNavigator.requesting && !fileNavigator.listHasFolders() && !fileNavigator.error">\r\n            <td>\r\n                {{"systemManagement.no_folders_in_folder" | translate}}...\r\n            </td>\r\n            <td class="text-right">\r\n                <button class="btn btn-sm btn-warning" ng-click="fileNavigator.upDir()">{{"systemManagement.go_back" | translate}}</button>\r\n            </td>\r\n        </tr>\r\n        <tr ng-show="!fileNavigator.requesting && fileNavigator.error">\r\n            <td colspan="2">\r\n                {{ fileNavigator.error }}\r\n            </td>\r\n        </tr>\r\n        <tr ng-repeat="item in fileNavigator.fileList | orderBy:predicate:reverse" ng-show="!fileNavigator.requesting && item.model.type === \'dir\'" ng-if="!selectedFilesAreChildOfPath(item)">\r\n            <td>\r\n                <a href="" ng-click="fileNavigator.folderClick(item)" title="{{item.model.name}} ({{item.model.size | humanReadableFileSize}})">\r\n                    <i class="glyphiconFM glyphicon-folder-close"></i>\r\n                    {{item.model.name | strLimit : 32}}\r\n                </a>\r\n            </td>\r\n            <td class="text-right">\r\n                <button class="btn btn-sm btn-warning" ng-click="select(item)">\r\n                    <i class="glyphiconFM glyphicon-hand-up"></i> {{"systemManagement.select_this" | translate}}\r\n                </button>\r\n            </td>\r\n        </tr>\r\n    </tbody>\r\n</table>'), e.put("src/templates/main-table.html", '<table class="tableFM mb0FM table-filesFM noselect">\r\n    <thead>\r\n        <tr>\r\n            <th>\r\n                <a href="" ng-click="order(\'model.name\')">\r\n                    {{"systemManagement.Name" | translate}}\r\n                    <span class="sortorder" ng-show="predicate[1] === \'model.name\'" ng-class="{reverse:reverse}"></span>\r\n                </a>\r\n            </th>\r\n            <th class="hidden-xs" ng-hide="config.hideSize">\r\n                <a href="" ng-click="order(\'model.size\')">\r\n                    {{"systemManagement.Size" | translate}}\r\n                    <span class="sortorder" ng-show="predicate[1] === \'model.size\'" ng-class="{reverse:reverse}"></span>\r\n                </a>\r\n            </th>\r\n            <th class="hidden-sm hidden-xs" ng-hide="config.hideDate">\r\n                <a href="" ng-click="order(\'model.date\')">\r\n                    {{"systemManagement.Date" | translate}}\r\n                    <span class="sortorder" ng-show="predicate[1] === \'model.date\'" ng-class="{reverse:reverse}"></span>\r\n                </a>\r\n            </th>\r\n            \r\n        </tr>\r\n    </thead>\r\n    <tbody class="file-item">\r\n        <tr ng-show="fileNavigator.requesting">\r\n            <td colspan="5">\r\n                <div ng-include="config.tplPath + \'/spinner.html\'"></div>\r\n            </td>\r\n        </tr>\r\n        <tr ng-show="!fileNavigator.requesting &amp;&amp; fileNavigator.fileList.length < 1 &amp;&amp; !fileNavigator.error">\r\n            <td colspan="5">\r\n                {{"systemManagement.no_files_in_folder" | translate}}...\r\n            </td>\r\n        </tr>\r\n        <tr ng-show="!fileNavigator.requesting &amp;&amp; fileNavigator.error">\r\n            <td colspan="5">\r\n                {{ fileNavigator.error }}\r\n            </td>\r\n        </tr>\r\n        <tr class="item-list" ng-repeat="item in $parent.fileList = (fileNavigator.fileList | filter: {model:{name: query}} | orderBy:predicate:reverse)" ng-show="!fileNavigator.requesting" ng-click="selectOrUnselect(item, $event)" ng-dblclick="smartClick(item)" ng-right-click="selectOrUnselect(item, $event)" ng-class="{selectedFM: isSelected(item)}">\r\n            <td>\r\n                <a href="" title="{{item.model.name}} ({{item.model.size | humanReadableFileSize}})">\r\n                    <i class="glyphiconFM glyphicon-folder-close" ng-show="item.model.type === \'dir\'"></i>\r\n                    <i class="glyphiconFM glyphicon-file" ng-show="item.model.type === \'file\'"></i>\r\n                    {{item.model.name | strLimit : 64}}\r\n                </a>\r\n            </td>\r\n            <td class="hidden-xs">\r\n                <span ng-show="item.model.type !== \'dir\' || config.showSizeForDirectories">\r\n                    {{item.model.size | humanReadableFileSize}}\r\n                </span>\r\n            </td>\r\n            <td class="hidden-sm hidden-xs" ng-hide="config.hideDate">\r\n                {{item.model.date | formatDate }}\r\n            </td>\r\n            \r\n        </tr>\r\n    </tbody>\r\n</table><div class="row" ng-if="totalItems"><div class="col-xs-5"><label style="margin-right: 5px !important;">Show <select class="pagination" ng-model="feed.config" ng-change="setItemsPerPage(feed.config)" ng-options="template.value as template.name for template in feed.configs"></select> entries</label></div><div class="col-xs-7"><uib-pagination total-items="totalItems" ng-model="currPage" ng-change="pageChanged(currPage)" max-size="maxSize" class="pagination-sm" items-per-page="itemsPerPage" boundary-links="true" rotate="false" num-pages="numPages"></uib-pagination></div></div>\r\n'), e.put("src/templates/main.html", '<div ng-controller="FileManagerCtrl">\r\n    <div ng-include="config.tplPath + \'/navbar.html\'"></div>\r\n\r\n    <div class="container-fluid">\r\n        <div class="row">\r\n\r\n            <div class="col-sm-4 col-md-3 sidebarFM file-treeFM animatedFM slow fadeIn" ng-include="config.tplPath + \'/sidebar.html\'" ng-show="config.sidebarFM &amp;&amp; fileNavigator.history[0]">\r\n            </div>\r\n\r\n            <div class="mainFM" ng-class="config.sidebarFM &amp;&amp; fileNavigator.history[0] &amp;&amp; \'col-sm-8 col-md-9\'" ngf-model-options="{updateOn: \'drop\', allowInvalid: false, debounce: 0}" ngf-drop="addForUpload($files)" ngf-drag-over-class="\'upload-dragover\'" ngf-multiple="true">\r\n                <div ng-include="config.tplPath + \'/\' + viewTemplate" class="main-navigation clearfix"></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n    <div ng-include="config.tplPath + \'/modals.html\'"></div>\r\n    <div ng-include="config.tplPath + \'/item-context-menu.html\'"></div>\r\n</div>\r\n'), e.put("src/templates/modals.html", '<div class="modal animatedFM fadeIn" id="imagepreview">\r\n  <div class="modal-dialog">\r\n    <div class="modal-content">\r\n      <div class="modal-header">\r\n        <button type="button" class="close" data-dismiss="modal">\r\n            <span aria-hidden="true">&times;</span>\r\n            <span class="sr-only">{{"systemManagement.close" | translate}}</span>\r\n        </button>\r\n        <h4 class="modal-title">{{"systemManagement.preview" | translate}}</h4>\r\n      </div>\r\n      <div class="modal-body">\r\n        <div class="text-center">\r\n          <img id="imagepreview-target" class="preview" alt="{{singleSelection().model.name}}" ng-class="{\'loading\': apiMiddleware.apiHandler.inprocess}">\r\n          <span class="label label-warning" ng-show="apiMiddleware.apiHandler.inprocess">{{\'loading\' | translate}} ...</span>\r\n        </div>\r\n        <div ng-include data-src="\'error-bar\'" class="clearfix"></div>\r\n      </div>\r\n      <div class="modal-footer">\r\n        <button type="button" class="btn btn-warning" data-dismiss="modal" ng-disabled="apiMiddleware.apiHandler.inprocess">{{"systemManagement.close" | translate}}</button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class="modal animatedFM fadeIn" id="remove">\r\n  <div class="modal-dialog">\r\n    <div class="modal-content">\r\n    <form ng-submit="remove()">\r\n      <div class="modal-header">\r\n        <button type="button" class="close" data-dismiss="modal">\r\n            <span aria-hidden="true">&times;</span>\r\n            <span class="sr-only">{{"systemManagement.close" | translate}}</span>\r\n        </button>\r\n        <h4 class="modal-title">{{"systemManagement.confirm" | translate}}</h4>\r\n      </div>\r\n      <div class="modal-body">\r\n        {{\'systemManagement.sure_to_delete\' | translate}} <span ng-include data-src="\'selected-files-msg\'"></span>\r\n\r\n        <div ng-include data-src="\'error-bar\'" class="clearfix"></div>\r\n      </div>\r\n      <div class="modal-footer">\r\n        <button type="submit" class="btn btn-primary" ng-disabled="apiMiddleware.apiHandler.inprocess" autofocus="autofocus">{{"systemManagement.remove" | translate}}</button>\r\n <button type="button" class="btn btn-warning" data-dismiss="modal" ng-disabled="apiMiddleware.apiHandler.inprocess">{{"systemManagement.cancel" | translate}}</button>       \r\n      </div>\r\n      </form>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class="modal animatedFM fadeIn" id="move">\r\n  <div class="modal-dialog">\r\n    <div class="modal-content">\r\n        <form ng-submit="move()">\r\n            <div class="modal-header">\r\n              <button type="button" class="close" data-dismiss="modal">\r\n                  <span aria-hidden="true">&times;</span>\r\n                  <span class="sr-only">{{"systemManagement.close" | translate}}</span>\r\n              </button>\r\n              <h4 class="modal-title">{{\'systemManagement.move\' | translate}}</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n              <div ng-include data-src="\'path-selector\'" class="clearfix"></div>\r\n              <div ng-include data-src="\'error-bar\'" class="clearfix"></div>\r\n            </div>\r\n            <div class="modal-footer">\r\n             <button type="submit" class="btn btn-primary" ng-disabled="apiMiddleware.apiHandler.inprocess">{{\'systemManagement.move\' | translate}}</button>\r\n    <button type="button" class="btn btn-warning" data-dismiss="modal" ng-disabled="apiMiddleware.apiHandler.inprocess">{{"systemManagement.cancel" | translate}}</button>          \r\n            </div>\r\n        </form>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n\r\n<div class="modal animatedFM fadeIn" id="rename">\r\n  <div class="modal-dialog">\r\n    <div class="modal-content">\r\n        <form ng-submit="rename()">\r\n            <div class="modal-header">\r\n              <button type="button" class="close" data-dismiss="modal">\r\n                  <span aria-hidden="true">&times;</span>\r\n                  <span class="sr-only">{{"systemManagement.close" | translate}}</span>\r\n              </button>\r\n              <h4 class="modal-title">{{\'systemManagement.rename\' | translate}}</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n              <label class="radio">{{\'systemManagement.enter_new_name_for\' | translate}} <b>{{singleSelection() && singleSelection().model.name}}</b></label>\r\n              <input class="form-control" ng-model="singleSelection().tempModel.name" autofocus="autofocus">\r\n\r\n              <div ng-include data-src="\'error-bar\'" class="clearfix"></div>\r\n            </div>\r\n            <div class="modal-footer">\r\n          <button type="submit" class="btn btn-primary" ng-disabled="apiMiddleware.apiHandler.inprocess">{{\'systemManagement.rename\' | translate}}</button>\r\n    <button type="button" class="btn btn-warning" data-dismiss="modal" ng-disabled="apiMiddleware.apiHandler.inprocess">{{"systemManagement.cancel" | translate}}</button>           \r\n            </div>\r\n        </form>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class="modal animatedFM fadeIn" id="copy">\r\n  <div class="modal-dialog">\r\n    <div class="modal-content">\r\n        <form ng-submit="copy()">\r\n            <div class="modal-header">\r\n              <button type="button" class="close" data-dismiss="modal">\r\n                  <span aria-hidden="true">&times;</span>\r\n                  <span class="sr-only">{{"systemManagement.close" | translate}}</span>\r\n              </button>\r\n              <h4 class="modal-title">{{\'systemManagement.copy_file\' | translate}}</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n              <div ng-show="singleSelection()">\r\n                <label class="radio">{{\'systemManagement.enter_new_name_for\' | translate}} <b>{{singleSelection().model.name}}</b></label>\r\n                <input class="form-control" ng-model="singleSelection().tempModel.name" autofocus="autofocus">\r\n              </div>\r\n\r\n              <div ng-include data-src="\'path-selector\'" class="clearfix"></div>\r\n              <div ng-include data-src="\'error-bar\'" class="clearfix"></div>\r\n            </div>\r\n            <div class="modal-footer">\r\n             <button type="submit" class="btn btn-primary" ng-disabled="apiMiddleware.apiHandler.inprocess">{{"copy" | translate}}</button>\r\n     <button type="button" class="btn btn-warning" data-dismiss="modal" ng-disabled="apiMiddleware.apiHandler.inprocess">{{"systemManagement.cancel" | translate}}</button>          \r\n            </div>\r\n        </form>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class="modal animatedFM fadeIn" id="compress">\r\n  <div class="modal-dialog">\r\n    <div class="modal-content">\r\n        <form ng-submit="compress()">\r\n            <div class="modal-header">\r\n              <button type="button" class="close" data-dismiss="modal">\r\n                  <span aria-hidden="true">&times;</span>\r\n                  <span class="sr-only">{{"systemManagement.close" | translate}}</span>\r\n              </button>\r\n              <h4 class="modal-title">{{\'systemManagement.compress\' | translate}}</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n              <div ng-show="apiMiddleware.apiHandler.asyncSuccess">\r\n                  <div class="label label-success error-msg">{{\'compression_started\' | translate}}</div>\r\n              </div>\r\n              <div ng-hide="apiMiddleware.apiHandler.asyncSuccess">\r\n                  <div ng-hide="config.allowedActions.compressChooseName">\r\n                    {{\'sure_to_start_compression_with\' | translate}} <b>{{singleSelection().model.name}}</b> ?\r\n                  </div>\r\n                  <div ng-show="config.allowedActions.compressChooseName">\r\n                    <label class="radio">\r\n                      {{\'systemManagement.enter_file_name_for_compression\' | translate}}\r\n                      <span ng-include data-src="\'selected-files-msg\'"></span>\r\n                    </label>\r\n                    <input class="form-control" ng-model="temp.tempModel.name" autofocus="autofocus">\r\n                  </div>\r\n              </div>\r\n\r\n              <div ng-include data-src="\'error-bar\'" class="clearfix"></div>\r\n            </div>\r\n            <div class="modal-footer">\r\n              <div ng-show="apiMiddleware.apiHandler.asyncSuccess">\r\n                  <button type="button" class="btn btn-warning" data-dismiss="modal" ng-disabled="apiMiddleware.apiHandler.inprocess">{{"systemManagement.close" | translate}}</button>\r\n              </div>\r\n              <div ng-hide="apiMiddleware.apiHandler.asyncSuccess">\r\n             <button type="submit" class="btn btn-primary" ng-disabled="apiMiddleware.apiHandler.inprocess">{{\'systemManagement.compress\' | translate}}</button>     \r\n    <button type="button" class="btn btn-warning" data-dismiss="modal" ng-disabled="apiMiddleware.apiHandler.inprocess">{{"systemManagement.cancel" | translate}}</button>              \r\n              </div>\r\n            </div>\r\n        </form>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class="modal animatedFM fadeIn" id="extract" ng-init="singleSelection().emptyName()">\r\n  <div class="modal-dialog">\r\n    <div class="modal-content">\r\n        <form ng-submit="extract()">\r\n            <div class="modal-header">\r\n              <button type="button" class="close" data-dismiss="modal">\r\n                  <span aria-hidden="true">&times;</span>\r\n                  <span class="sr-only">{{"systemManagement.close" | translate}}</span>\r\n              </button>\r\n              <h4 class="modal-title">{{\'systemManagement.extract_item\' | translate}}</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n              <div ng-show="apiMiddleware.apiHandler.asyncSuccess">\r\n                  <div class="label label-success error-msg">{{\'extraction_started\' | translate}}</div>\r\n              </div>\r\n              <div ng-hide="apiMiddleware.apiHandler.asyncSuccess">\r\n                  <label class="radio">{{\'systemManagement.enter_folder_name_for_extraction\' | translate}} <b>{{singleSelection().model.name}}</b></label>\r\n                  <input class="form-control" ng-model="singleSelection().tempModel.name" autofocus="autofocus">\r\n              </div>\r\n              <div ng-include data-src="\'error-bar\'" class="clearfix"></div>\r\n            </div>\r\n            <div class="modal-footer">\r\n              <div ng-show="apiMiddleware.apiHandler.asyncSuccess">\r\n                  <button type="button" class="btn btn-warning" data-dismiss="modal" ng-disabled="apiMiddleware.apiHandler.inprocess">{{"systemManagement.close" | translate}}</button>\r\n              </div>\r\n              <div ng-hide="apiMiddleware.apiHandler.asyncSuccess">\r\n              <button type="submit" class="btn btn-primary" ng-disabled="apiMiddleware.apiHandler.inprocess">{{\'systemManagement.extract\' | translate}}</button>   \r\n   <button type="button" class="btn btn-warning" data-dismiss="modal" ng-disabled="apiMiddleware.apiHandler.inprocess">{{"systemManagement.cancel" | translate}}</button>                \r\n              </div>\r\n            </div>\r\n        </form>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class="modal animatedFM fadeIn" id="edit" ng-class="{\'modal-fullscreen\': fullscreen}">\r\n  <div class="modal-dialog modal-lg">\r\n    <div class="modal-content">\r\n        <form ng-submit="edit()">\r\n            <div class="modal-header">\r\n              <button type="button" class="close" data-dismiss="modal">\r\n                  <span aria-hidden="true">&times;</span>\r\n                  <span class="sr-only">{{"systemManagement.close" | translate}}</span>\r\n              </button>\r\n              <button type="button" class="close fullscreen" ng-click="fullscreen=!fullscreen">\r\n                  <i class="glyphiconFM glyphicon-fullscreen"></i>\r\n                  <span class="sr-only">{{\'toggle_fullscreen\' | translate}}</span>\r\n              </button>\r\n              <h4 class="modal-title">{{\'systemManagement.edit_file\' | translate}}</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n                <label class="radio bold">{{ singleSelection().model.fullPath() }}</label>\r\n                <span class="label label-warning" ng-show="apiMiddleware.apiHandler.inprocess">{{\'loading\' | translate}} ...</span>\r\n                <textarea class="form-control code" ng-model="singleSelection().tempModel.content" ng-show="!apiMiddleware.apiHandler.inprocess" autofocus="autofocus"></textarea>\r\n                <div ng-include data-src="\'error-bar\'" class="clearfix"></div>\r\n            </div>\r\n            <div class="modal-footer">\r\n         <button type="submit" class="btn btn-primary" ng-show="config.allowedActions.edit" ng-disabled="apiMiddleware.apiHandler.inprocess">{{\'systemManagement.save\' | translate}}</button>     \r\n     <button type="button" class="btn btn-warning" data-dismiss="modal" ng-disabled="apiMiddleware.apiHandler.inprocess">{{\'close\' | translate}}</button>         \r\n            </div>\r\n        </form>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class="modal animatedFM fadeIn" id="newfolder">\r\n  <div class="modal-dialog">\r\n    <div class="modal-content">\r\n        <form ng-submit="createFolder()">\r\n            <div class="modal-header">\r\n              <button type="button" class="close" data-dismiss="modal">\r\n                  <span aria-hidden="true">&times;</span>\r\n                  <span class="sr-only">{{"systemManagement.close" | translate}}</span>\r\n              </button>\r\n              <h4 class="modal-title">{{\'systemManagement.new_folder\' | translate}}</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n              <label class="radio">{{\'systemManagement.folder_name\' | translate}}</label>\r\n              <input class="form-control" ng-model="singleSelection().tempModel.name" autofocus="autofocus">\r\n              <div ng-include data-src="\'error-bar\'" class="clearfix"></div>\r\n            </div>\r\n            <div class="modal-footer">\r\n           <button type="submit" class="btn btn-primary" ng-disabled="apiMiddleware.apiHandler.inprocess">{{\'systemManagement.create\' | translate}}</button>   \r\n     <button type="button" class="btn btn-warning" data-dismiss="modal" ng-disabled="apiMiddleware.apiHandler.inprocess">{{"systemManagement.cancel" | translate}}</button>         \r\n            </div>\r\n        </form>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class="modal animatedFM fadeIn" id="uploadfile">\r\n  <div class="modal-dialog">\r\n    <div class="modal-content">\r\n        <form>\r\n            <div class="modal-header">\r\n              <button type="button" class="close" data-dismiss="modal">\r\n                  <span aria-hidden="true">&times;</span>\r\n                  <span class="sr-only">{{"systemManagement.close" | translate}}</span>\r\n              </button>\r\n              <h4 class="modal-title">{{"systemManagement.upload_files" | translate}}</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n              <label class="radio">\r\n                {{"systemManagement.files_will_uploaded_to" | translate}} \r\n                <b>/{{fileNavigator.currentPath.join(\'/\')}}</b>\r\n              </label>\r\n              <button class="btn btn-warning btn-block" ngf-select="$parent.addForUpload($files)" ngf-multiple="true">\r\n                {{"systemManagement.select_files" | translate}}\r\n              </button>\r\n              \r\n              <div class="upload-list">\r\n                <ul class="list-group">\r\n                  <li class="list-group-item" ng-repeat="(index, uploadFile) in $parent.uploadFileList">\r\n                    <button class="btn btn-sm btn-danger pull-right" ng-click="$parent.removeFromUpload(index)">\r\n                        &times;\r\n                    </button>\r\n                    <h5 class="list-group-item-heading">{{uploadFile.name}}</h5>\r\n                    <p class="list-group-item-text">{{uploadFile.size | humanReadableFileSize}}</p>\r\n                  </li>\r\n                </ul>\r\n                <div ng-show="apiMiddleware.apiHandler.inprocess">\r\n                  <em>{{"systemManagement.uploading" | translate}}... {{apiMiddleware.apiHandler.progress}}%</em>\r\n                  <div class="progress mb0FM">\r\n                    <div class="progress-bar active" role="progressbar" aria-valuenow="{{apiMiddleware.apiHandler.progress}}" aria-valuemin="0" aria-valuemax="100" style="width: {{apiMiddleware.apiHandler.progress}}%"></div>\r\n                  </div>\r\n                </div>\r\n              </div>\r\n              <div ng-include data-src="\'error-bar\'" class="clearfix"></div>\r\n            </div>\r\n            <div class="modal-footer">\r\n              <div>\r\n               <button type="submit" class="btn btn-primary" ng-disabled="!$parent.uploadFileList.length || apiMiddleware.apiHandler.inprocess" ng-click="uploadFiles()">{{\'systemManagement.upload\' | translate}}</button>   \r\n         <button type="button" class="btn btn-warning" data-dismiss="modal">{{"systemManagement.cancel" | translate}}</button>         \r\n              </div>\r\n            </div>\r\n        </form>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class="modal animatedFM fadeIn" id="changepermissions">\r\n  <div class="modal-dialog">\r\n    <div class="modal-content">\r\n        <form ng-submit="changePermissions()">\r\n            <div class="modal-header">\r\n              <button type="button" class="close" data-dismiss="modal">\r\n                  <span aria-hidden="true">&times;</span>\r\n                  <span class="sr-only">{{"systemManagement.close" | translate}}</span>\r\n              </button>\r\n              <h4 class="modal-title">{{\'systemManagement.change_permissions\' | translate}}</h4>\r\n            </div>\r\n            <div class="modal-body">\r\n              <table class="tableFM mb0FM">\r\n                  <thead>\r\n                      <tr>\r\n                          <th>{{\'systemManagement.permissions\' | translate}}</th>\r\n                          <th class="col-xs-1 text-center">{{\'systemManagement.read\' | translate}}</th>\r\n                          <th class="col-xs-1 text-center">{{\'systemManagement.write\' | translate}}</th>\r\n                          <th class="col-xs-1 text-center">{{\'systemManagement.exec\' | translate}}</th>\r\n                      </tr>\r\n                  </thead>\r\n                  <tbody>\r\n                      <tr ng-repeat="(permTypeKey, permTypeValue) in temp.tempModel.perms">\r\n                          <td>{{permTypeKey | translate}}</td>\r\n                          <td ng-repeat="(permKey, permValue) in permTypeValue" class="col-xs-1 text-center" ng-click="main()">\r\n                              <label class="col-xs-12">\r\n                                <input type="checkbox" ng-model="temp.tempModel.perms[permTypeKey][permKey]">\r\n                              </label>\r\n                          </td>\r\n                      </tr>\r\n                </tbody>\r\n              </table>\r\n              <div class="checkbox" ng-show="config.enablePermissionsRecursive && selectionHas(\'dir\')">\r\n                <label>\r\n                  <input type="checkbox" ng-model="temp.tempModel.recursive"> {{\'recursive\' | translate}}\r\n                </label>\r\n              </div>\r\n              <div class="clearfix mt10FM">\r\n                  <span class="label label-primary pull-left" ng-hide="temp.multiple">\r\n                    {{\'original\' | translate}}: \r\n                    {{temp.model.perms.toCode(selectionHas(\'dir\') ? \'d\':\'-\')}} \r\n                    ({{temp.model.perms.toOctal()}})\r\n                  </span>\r\n                  <span class="label label-primary pull-right">\r\n                    {{\'changes\' | translate}}: \r\n                    {{temp.tempModel.perms.toCode(selectionHas(\'dir\') ? \'d\':\'-\')}} \r\n                    ({{temp.tempModel.perms.toOctal()}})\r\n                  </span>\r\n              </div>\r\n              <div ng-include data-src="\'error-bar\'" class="clearfix"></div>\r\n            </div>\r\n            <div class="modal-footer">\r\n           <button type="submit" class="btn btn-primary" ng-disabled="">{{\'systemManagement.change\' | translate}}</button>   \r\n   <button type="button" class="btn btn-warning" data-dismiss="modal">{{"systemManagement.cancel" | translate}}</button>           \r\n            </div>\r\n        </form>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class="modal animatedFM fadeIn" id="selector" ng-controller="ModalFileManagerCtrl">\r\n  <div class="modal-dialog">\r\n    <div class="modal-content">\r\n      <div class="modal-header">\r\n        <button type="button" class="close" data-dismiss="modal">\r\n            <span aria-hidden="true">&times;</span>\r\n            <span class="sr-only">{{"systemManagement.close" | translate}}</span>\r\n        </button>\r\n        <h4 class="modal-title">{{"select_destination_folder" | translate}}</h4>\r\n      </div>\r\n      <div class="modal-body">\r\n        <div>\r\n            <div ng-include="config.tplPath + \'/current-folder-breadcrumb.html\'"></div>\r\n            <div ng-include="config.tplPath + \'/main-table-modal.html\'"></div>\r\n            <hr />\r\n            <button class="btn btn-sm btn-warning" ng-click="selectCurrent()">\r\n                <i class="glyphiconFM"></i> {{"systemManagement.select_this" | translate}}\r\n            </button>\r\n        </div>\r\n      </div>\r\n      <div class="modal-footer">\r\n        <button type="button" class="btn btn-warning" data-dismiss="modal" ng-disabled="apiMiddleware.apiHandler.inprocess">{{"systemManagement.close" | translate}}</button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<script type="text/ng-template" id="path-selector">\r\n  <div class="panel panel-primary mt10FM mb0FM">\r\n    <div class="panel-body">\r\n        <div class="detail-sources">\r\n          <div class="like-code mr5FM"><b>{{"systemManagement.selection" | translate}}:</b>\r\n            <span ng-include="\'selected-files-msg\'"></span>\r\n          </div>\r\n        </div>\r\n        <div class="detail-sourcesFM">\r\n          <div class="like-code mr5FM">\r\n            <b>{{"systemManagement.destination" | translate}}:</b> {{ getSelectedPath() }}\r\n          </div>\r\n          <a href="" class="label label-primary" ng-click="openNavigator(fileNavigator.currentPath)">\r\n            {{\'systemManagement.change\' | translate}}\r\n          </a>\r\n        </div>\r\n    </div>\r\n  </div>\r\n<\/script>\r\n\r\n<script type="text/ng-template" id="error-bar">\r\n  <div class="label label-danger error-msg pull-left animatedFM fadeIn" ng-show="apiMiddleware.apiHandler.error">\r\n    <i class="glyphiconFM glyphicon-remove-circle"></i>\r\n    <span>{{apiMiddleware.apiHandler.error}}</span>\r\n  </div>\r\n<\/script>\r\n\r\n<script type="text/ng-template" id="selected-files-msg">\r\n  <span ng-show="temps.length == 1">\r\n    {{singleSelection().model.name}}\r\n  </span>\r\n  <span ng-show="temps.length > 1">\r\n    {{\'these_elements\' | translate:totalSelecteds()}}\r\n    <a href="" class="label label-primary" ng-click="showDetails = !showDetails">\r\n      {{showDetails ? \'-\' : \'+\'}} {{\'details\' | translate}}\r\n    </a>\r\n  </span>\r\n  <div ng-show="temps.length > 1 &amp;&amp; showDetails">\r\n    <ul class="selected-file-detailsFM">\r\n      <li ng-repeat="tempItem in temps">\r\n        <b>{{tempItem.model.name}}</b>\r\n      </li>\r\n    </ul>\r\n  </div>\r\n<\/script>\r\n'), e.put("src/templates/navbar.html", '<nav class="navbarFM navbar-inverseFM">\r\n    <div class="container-fluid">\r\n        <div class="row">\r\n            <div class="col-sm-9 col-md-10 hidden-xs">\r\n                <div ng-show="!config.breadcrumb">\r\n                    <a class="navbar-brandFM hidden-xs ng-binding" href="">angular-{{"filemanager" | translate}}</a>\r\n                </div>\r\n                <div ng-include="config.tplPath + \'/current-folder-breadcrumb.html\'" ng-show="config.breadcrumb">\r\n                </div>\r\n            </div>\r\n            <div class="col-sm-3 col-md-2">\r\n                <div class="navbar-collapseFM">\r\n                    <div class="navbar-formFM navbar-right text-right">\r\n                        <div class="pull-left visible-xs" ng-if="fileNavigator.currentPath.length">\r\n                            <button class="btn btn-primary btn-flatFM" ng-click="fileNavigator.upDir()">\r\n                                <i class="glyphiconFM glyphicon-chevron-left"></i>\r\n                            </button>\r\n                            {{fileNavigator.getCurrentFolderName() | strLimit : 12}}\r\n                        </div>\r\n                        <div class="btn-group">\r\n                            <button class="btn btn-flatFM btn-sm dropdown-toggle" type="button" id="dropDownMenuSearch" data-toggle="dropdown" aria-expanded="true">\r\n                                <i class="glyphiconFM glyphicon-search mr2FM"></i>\r\n                            </button>\r\n                            <div class="dropdown-menu animatedFM fast fadeIn pull-right" role="menu" aria-labelledby="dropDownMenuLang">\r\n                                <input type="text" class="form-control" ng-show="config.searchForm" placeholder="{{\'systemManagement.search\' | translate}}..." ng-model="$parent.query">\r\n                            </div>\r\n                        </div>\r\n\r\n                        <button class="btn btn-flatFM btn-sm" ng-click="$parent.setTemplate(\'main-icons.html\')" ng-show="$parent.viewTemplate !==\'main-icons.html\'" title="{{\'systemManagement.icons\' | translate}}">\r\n                            <i class="glyphiconFM glyphicon-th-large"></i>\r\n                        </button>\r\n\r\n                        <button class="btn btn-flatFM btn-sm" ng-click="$parent.setTemplate(\'main-table.html\')" ng-show="$parent.viewTemplate !==\'main-table.html\'" title="{{\'list\' | translate}}">\r\n                            <i class="glyphiconFM glyphicon-th-list"></i>\r\n                        </button>\r\n\r\n <div class="btn-group">\r\n                            <button class="btn btn-flatFM btn-sm dropdown-toggle" type="button" id="more" data-toggle="dropdown" aria-expanded="true">\r\n                                <i class="glyphiconFM glyphicon-option-vertical"></i>\r\n                            </button>\r\n\r\n                            <ul class="dropdown-menu scrollable-menu animatedFM fast fadeIn pull-right" role="menu" aria-labelledby="more">\r\n                                <li role="presentation" ng-show="config.allowedActions.createFolder" ng-click="modal(\'newfolder\') && prepareNewFolder()">\r\n                                    <a href="" role="menuitem" tabindex="-1">\r\n                                        <i class="glyphiconFM glyphicon-plus"></i> {{"systemManagement.new_folder" | translate}}\r\n                                    </a>\r\n                                </li>\r\n                                <li role="presentation" ng-show="config.allowedActions.upload" ng-click="modal(\'uploadfile\')">\r\n                                    <a href="" role="menuitem" tabindex="-1">\r\n                                        <i class="glyphiconFM glyphicon-cloud-upload"></i> {{"systemManagement.upload_files" | translate}}\r\n                                    </a>\r\n                                </li>\r\n \r\n                               <li role="presentation" ng-show="config.allowedActions.cleanup" ng-click="cleanup(path)">\r\n   <a href="" role="menuitem" tabindex="-1">\r\n  <i class="glyphiconFM glyphicon-wrench"></i> {{"systemManagement.cleanup_file" | translate}}\r\n                                    </a>\r\n                                </li>\r\n                           </ul>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</nav>\r\n'), e.put("src/templates/sidebar.html", '<ul class="nav nav-sidebarFM file-tree-rootFM">\r\n    <li ng-repeat="item in fileNavigator.history" ng-include="\'folder-branch-item\'" ng-class="{\'active\': item.name == fileNavigator.currentPath.join(\'/\')}"></li>\r\n</ul>\r\n\r\n<script type="text/ng-template" id="folder-branch-item">\r\n    <a href="" ng-click="fileNavigator.folderClick(item.item)" class="animatedFM fast fadeInDown">\r\n\r\n        <div class="point">\r\n            <i class="glyphiconFM glyphicon-chevron-down" ng-show="isInThisPath(item.name)"></i>\r\n            <i ng-show="!isInThisPath(item.name)"></i>\r\n        </div>\r\n\r\n        <i class="glyphiconFM glyphicon-folder-open mr2FM" ng-show="isInThisPath(item.name)"></i>\r\n        <i class="glyphiconFM glyphicon-folder-close mr2FM" ng-show="!isInThisPath(item.name)"></i>\r\n        {{ (item.name.split(\'/\').pop() || fileNavigator.getBasePath().join(\'/\') || \'/\') | strLimit : 30 }}\r\n    </a>\r\n    <ul class="nav nav-sidebarFM">\r\n        <li ng-repeat="item in item.nodes" ng-include="\'folder-branch-item\'" ng-class="{\'active\': item.name == fileNavigator.currentPath.join(\'/\')}"></li>\r\n    </ul>\r\n<\/script>'), e.put("src/templates/spinner.html", '<div class="spinner-wrapper col-xs-12">\r\n    <svg class="spinner-containerFM" style="width:65px;height:65px" viewBox="0 0 44 44">\r\n        <circle class="path" cx="22" cy="22" r="20" fill="none" stroke-width="4"></circle>\r\n    </svg>\r\n</div>');
    }]);