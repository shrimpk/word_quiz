//Get Date
function getdate() {
    var date = new Date()
    return date.getFullYear() + ("0" + (Number(date.getMonth()) + 1)).slice(-2) + ("0" + date.getDate()).slice(-2)
}

function getfilename(date, num) {
    /*fs.stat("./tex/"+date+"-"+num+".tex", function(err, stats) {
        if (err.code !== null) {
            if (err.code === "ENOENT") {
                console.log(date+num)
                return date+"-"+num
                
            } else {
                getfilename(date, num + 1)
            }
        } else {
            getfilename(date, num + 1)
        }
    }) */
    if(fs.access("./tex/"+date+"-"+num+".tex")) {
        return date+"-"+num
    } else {
        getfilename(date, num + 1)
    }
}

function getfilenamec(date, num, callback) {
    /*fs.stat("./tex/"+date+"-"+num+".tex", function(err, stats) {
        if (err.code === "ENOENT") {
            console.log(date+num)
            callback(date+"-"+num)
            
        } else {
            getfilename(date, num + 1)
        }
    })

    fs.stat("./tex/"+date+"-"+num+".tex", function(err, stats) {
        if (err.code !== null) {
            if (err.code === "ENOENT") {
                console.log(date+num)
                return date+"-"+num
                
            } else {
                getfilename(date, num + 1)
            }
        } else {
            getfilename(date, num + 1)
        }
    }) */
    fs.access("./tex/"+date+"-"+num+".tex", function(err) {
        if (err) {
            console.log("accessible")
            callback(date+"-"+num)
        } else {
            console.log("callback")
            getfilenamec(date, num + 1, callback)
        }
    })
}

function gettemplate(num) {
    return fs.readFileSync("./tex/include/template"+num+".tex", "utf8")
}



//Making Exam
var WordNet = require('node-wordnet')
var wordnet = new WordNet()
var fs = require('fs')
var word_sources = []
var words_for_test = []
var words_test = []

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


async function findsynonyms(word, callback1) {
    var tempsyn = []
    var tempexp = []
    var temppos = []
    await wordnet.lookup(word, async function(results) {
        await results.forEach(function(currentValue) {
            currentValue.synonyms.forEach(function(words) {
                if (!words.toLowerCase().includes(word) && !tempsyn.includes(words.toLowerCase())) {
                    tempsyn.push(words)
                }
            })
            currentValue.exp.forEach(function(exps) {
                if (exps.includes(word)) {
                    tempexp.push(exps.replace(word, "(\\quad)"))
                }
            })
            if (!temppos.includes(currentValue.pos)) {
                temppos.push(currentValue.pos)
            }
        })
        await callback1(tempsyn, tempexp, temppos)
    })

}

async function findpos(word, callback1) {
    var temppos = []
    await wordnet.lookup(word, async function(results) {
        await results.forEach(function(currentValue) {
            if (!temppos.includes(currentValue.pos)) {
                temppos.push(currentValue.pos)
            }
        })
    })
    await callback1(temppos)
}

async function findnotsynonyms(word, synonyms, pos, callback) {
    var randm = 0
    var notsyn = -1
    while (notsyn == -1) {
        randm = await Math.floor(Math.random() * word_sources.length)
        if (!synonyms.includes(word_sources[randm])) {
            if (word_sources[randm] !== word) {
                var poss = 0
                await findpos(word_sources[randm], async function(ws_pos) {
                    poss = ws_pos
                    notsyn = word_sources[randm]
                })
            }
        }
    }
    await callback(word_sources[randm])
}


async function run() {
    await execute(1, async function() {
        await execute(0, async function() {
            await shuffleArray(words_test)
            await words_test.forEach(function(item) {
                console.log(item)
            })
        })
    })
}

async function execute(pmode, callback) {
    const regex = /\r/ig
    var fd = fs.readFileSync("./word_sources.txt", "utf8")
    word_sources = await fd.replace(regex, "").split("\n")
    var fd = fs.readFileSync("./tests/" + today + ".txt", "utf8")
    words_for_test = await fd.replace(regex, "").split("\n")
    var owari = 0
    for (i = 0; i < words_for_test.length - 1; i++) {
        await makeselect(words_for_test[i], i, pmode, async function(j) {
            owari = owari + 1
            if (owari == words_for_test.length - 1) {
                await callback()
            }
        })
    }

}

async function makeselect(word_for_select, num, pmode, callback) {
    findsynonyms(word_for_select, async function(synonyms, exps, pos) {
        if (synonyms.length > 2 && pmode == 0) {
            var tempsel = []
            for (i = 0; i < 2; i++) {
                while (tempsel.length < 3) { var randn = Math.floor(Math.random() * synonyms.length); if (!tempsel.includes(synonyms[randn])) { await tempsel.push(synonyms[randn]) } }
            }
            await findnotsynonyms(word_for_select, synonyms, pos, async function(falsevalue) {
                tempsel.push(falsevalue)
                await shuffleArray(tempsel)
                var sel = [word_for_select]
                await tempsel.forEach(function(sel_v) {
                    sel.push(sel_v.replaceAll("_", " ").replaceAll("(a)", "").replaceAll("(v)", "").replaceAll("(n)", "").replaceAll("(p)", ""))
                })
                await sel.push(falsevalue)
                await words_test.push(sel)
                await callback(num)
            })
        } else {
            await callback(num)
        }
    })
}

//Web Server
var express = require('express')
var app = express()
var ejs = require('ejs')
var q = 0
var maxq = 0
var data = []
var wakaranai = []
var wakaranai2 = []
var wakaranai3 = []
var shitteru = []
var before = "N/A"
var beforem = []
var befores = []
var today = getdate()

rst(today)


function render(req, res) {
    res.render("main.ejs", { data: data, score: q, bar: Math.abs((q / maxq) * 100), before: before, beforem: beforem, befores:befores })
}

app.set('view engine', 'ejs')

app.get("/", function(req, res) {
    if (q < maxq) {
        if (data.length == 0) {
            if (words_test.length == 0) {
                words_test = []
                execute(0, function() {
                    shuffleArray(words_test)
                    data = words_test.pop()
                    render(req, res)
                    console.log("Refreshed!")
                })
            } else {
                shuffleArray(words_test)
                data = words_test.pop()
                render(req, res)
            }
        } else {
            render(req, res)
        }
    } else {
        getfilenamec(today, 0, function(k) {
            res.render("otsukare.ejs", { wakannnai: wakaranai, shitteru: shitteru, wakannnai2: wakaranai2, wakannnai3: wakaranai3, filename: k})
            makepdf(k, 0)
        })
    }
})

app.get("/meaning", function(req, res) {
    res.render("means.ejs", {score: q, bar: Math.abs((q / maxq) * 100), before: before, beforem: beforem, befores: befores})
})

async function findmeanings(word, callback1) {
    var temp_m = []
    var temp_s = []
    await wordnet.lookup(word, async function(results) {
        await results.forEach(async function(currentValue) {
            await temp_m.push(currentValue.def)
            await temp_s.push(currentValue.synonyms)
            if (currentValue == results[results.length - 1]) {
                await console.log("Ahoy")
                await callback1(temp_m, temp_s)
            }
        })
    })

}

app.post("/correct/:id/:id2", function(req, res) {
    data = []
    q = q + 1
    if (q > maxq) {
        q = maxq
    }
    console.log(q+"/"+maxq)
    before = req.params.id
    findmeanings(before, function(tempm, temps) {
        beforem = tempm
        befores = temps
        res.send(beforem)
    })
    if (!wakaranai.includes(req.params.id) && !shitteru.includes(req.params.id)) {
        shitteru.push(req.params.id)
    }
    if (wakaranai.includes(req.params.id)) {
        wakaranai2.push(req.params.id2)
    }
})
app.post("/false/:id/:id2", function(req, res) {
    q = q - 0.5
    if (q < 0) { q = 0 }
    console.log(q)
    if (!wakaranai.includes(req.params.id) && !wakaranai3.includes(req.params.id) && !shitteru.includes(req.params.id)) {
        wakaranai.push(req.params.id)
    }
    if (!wakaranai.includes(req.params.id2) && !wakaranai3.includes(req.params.id2)) {
        wakaranai3.push(req.params.id2)
    }
    res.send("Requested")
})


app.use(express.static(__dirname + '/static'))

app.listen(fs.readFileSync("port.conf").toString(), function() {
    console.log("Wordtester is running :^)")
})

function rst(filename) {
    const regex = /\r/ig
    var fd = fs.readFileSync("./tests/" + filename + ".txt", "utf8")
    maxq = Math.floor(fd.replace(regex, "").split("\n").length * 1.2)
    q = 0
    data = []
    wakaranai = []
    wakaranai2 = []
    wakaranai3 = []
    before = "N/A"
    beforem = []
    befores = []
}

app.get("/rst", function(req, res) {
    rst(today)
    res.send("Requested")
})

//pdf-maker
var cmd = require('node-cmd');
var words_testq = ""



function makepdf(fnn) {
    var meanq = ""
    var aftq = ""
    words_testq = ""
    wakaranai.forEach(function(value, index) {
        findmeanings(value, async function(tempm, temps) {
            expp = ""
            await tempm.forEach(function(expp_v) {
                expp = expp + "\\item " + expp_v
            })
            meanq = meanq + "\\wordmeaning{" + value + "}{" + expp + "}"
            if (index == wakaranai.length - 1) {
                synpp = ""
                await wakaranai3.forEach(function(expp_v) {
                    synpp = synpp + "\\item " + expp_v
                })
                morepp = ""
                await wakaranai2.forEach(function(expp_v) {
                    morepp = morepp + "\\item " + expp_v
                })
                shipp = ""
                await shitteru.forEach(function(expp_v) {
                    shipp = shipp + "\\item " + expp_v
                })
                if (shipp !== "") {aftq = aftq + "\\wordmeaningl{Synonyms:}{" + synpp + "}"}
                if (shipp !== "") {aftq = aftq + "\\wordmeaningl{It is good for you to memorize these words:}{" + morepp + "}"}
                if (shipp !== "") {aftq = aftq + "\\wordmeaningl{Here are the words that you know well:}{" + shipp + "}"}
                console.log("making PDF...  "+fnn+wakaranai)
                await executeq(1, function() {
                    words_testq = words_testq + "\\begin{footnotesize}\\textbf{Choose the one with a different meaning.}\\end{footnotesize}"
                    executeq(0, function() {
                        fs.writeFile("./tex/" + fnn + ".tex", gettemplate(1) + "\n\\subsubsection{" + today + "}\n" + meanq + aftq + "\\onecolumn\\twocolumn\\subsubsection{Review Test}\n" + words_testq + gettemplate(2), function(err, fd) {
                            if (err) { console.log(err) }
                            cmd.run("xelatex -output-directory static/pdf tex/"+fnn+".tex")
                        })
                    })
                })
            }
        })
    })
}

async function executeq(pmode, callback) {
    const regex = /\r/ig
    var fd = fs.readFileSync("./word_sources.txt", "utf8")
    word_sources = await fd.replace(regex, "").split("\n")
    var owari = 0
    for (i = 0; i < wakaranai.length; i++) {
        await console.log(i)
        await makeselectq(wakaranai[i], i, pmode, async function(j) {
            owari = owari + 1
            console.log(j+"__"+owari)
            if (owari == wakaranai.length) {
                await callback()
            }
        })
    }
    if (wakaranai.length == 0) { callback() }
}

async function makeselectq(word_for_select, num, pmode, callback) {
    findsynonyms(word_for_select, async function(synonyms, exps, pos) {
        if (synonyms.length > 2 && pmode == 0) {
            var tempsel = []
            for (i = 0; i < 2; i++) {
                while (tempsel.length < 3) { var randn = Math.floor(Math.random() * synonyms.length); if (!tempsel.includes(synonyms[randn])) { await tempsel.push(synonyms[randn]) } }
            }
            await findnotsynonyms(word_for_select, synonyms, pos, async function(falsevalue) {
                tempsel.push(falsevalue)
                await shuffleArray(tempsel)
                var sel = ""
                await tempsel.forEach(function(sel_v) {
                    sel = sel + "{" + sel_v.replaceAll("_", " ") + "}"
                })
                words_testq = words_testq + "\\wordtest{" + word_for_select + "}" + sel + "{" + ["A", "B", "C", "D"][tempsel.indexOf(falsevalue)] + "}\n"
                await console.log(num)
                await callback(num)
            })
        } else {
            if (exps.length > 1 && pmode == 1) {
                var tempsel = []
                await findnotsynonyms(word_for_select, synonyms, pos, async function(falsevalue1) {
                    await findnotsynonyms(word_for_select, synonyms, pos, async function(falsevalue2) {
                        await findnotsynonyms(word_for_select, synonyms, pos, async function(falsevalue3) {
                            await tempsel.push(falsevalue1)
                            await tempsel.push(falsevalue2)
                            await tempsel.push(falsevalue3)
                            await tempsel.push(word_for_select)
                            await shuffleArray(tempsel)
                            var sel = ""
                            await tempsel.forEach(function(sel_v) {
                                sel = sel + "{" + sel_v.replaceAll("_", " ") + "}"
                            })
                            var expp = ""
                            await exps.forEach(function(expp_v) {
                                expp = expp + "\\item " + expp_v
                            })
                            words_testq = words_testq + "\\wordteste{" + expp + "}" + sel + "{" + ["A", "B", "C", "D"][tempsel.indexOf(word_for_select)] + "}"
                            await callback(num)
                        })
                    })
                })
            } else {
                await callback(num)
            }
        }
    })
}