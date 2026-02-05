/* PrismJS 1.17.1
https://prismjs.com/download.html#themes=prism&languages=markup+css+clike+javascript+pug */
const _self =
        typeof window !== 'undefined'
                ? window
                : typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope
                ? self
                : {};
const Prism = (function(u) {
        const c = /\blang(?:uage)?-([\w-]+)\b/i;
        let n = 0;
        var C = {
                manual: u.Prism && u.Prism.manual,
                disableWorkerMessageHandler: u.Prism && u.Prism.disableWorkerMessageHandler,
                util: {
                        encode(e) {
                                return e instanceof _
                                        ? new _(e.type, C.util.encode(e.content), e.alias)
                                        : Array.isArray(e)
                                        ? e.map(C.util.encode)
                                        : e
                                                  .replace(/&/g, '&amp;')
                                                  .replace(/</g, '&lt;')
                                                  .replace(/\u00a0/g, ' ');
                        },
                        type(e) {
                                return Object.prototype.toString.call(e).slice(8, -1);
                        },
                        objId(e) {
                                return e.__id || Object.defineProperty(e, '__id', { value: ++n }), e.__id;
                        },
                        clone: function r(e, t) {
                                let a;
                                let n;
                                const i = C.util.type(e);
                                switch (((t = t || {}), i)) {
                                        case 'Object':
                                                if (((n = C.util.objId(e)), t[n])) return t[n];
                                                for (const o in ((a = {}), (t[n] = a), e))
                                                        e.hasOwnProperty(o) && (a[o] = r(e[o], t));
                                                return a;
                                        case 'Array':
                                                return (
                                                        (n = C.util.objId(e)),
                                                        t[n]
                                                                ? t[n]
                                                                : ((a = []),
                                                                  (t[n] = a),
                                                                  e.forEach(function(e, n) {
                                                                          a[n] = r(e, t);
                                                                  }),
                                                                  a)
                                                );
                                        default:
                                                return e;
                                }
                        },
                        getLanguage(e) {
                                for (; e && !c.test(e.className); ) e = e.parentElement;
                                return e ? (e.className.match(c) || [, 'none'])[1].toLowerCase() : 'none';
                        },
                        currentScript() {
                                if (typeof document === 'undefined') return null;
                                if ('currentScript' in document) return document.currentScript;
                                try {
                                        throw new Error();
                                } catch (e) {
                                        const n = (/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(e.stack) || [])[1];
                                        if (n) {
                                                const r = document.getElementsByTagName('script');
                                                for (const t in r) if (r[t].src == n) return r[t];
                                        }
                                        return null;
                                }
                        },
                },
                languages: {
                        extend(e, n) {
                                const r = C.util.clone(C.languages[e]);
                                for (const t in n) r[t] = n[t];
                                return r;
                        },
                        insertBefore(r, e, n, t) {
                                const a = (t = t || C.languages)[r];
                                const i = {};
                                for (const o in a)
                                        if (a.hasOwnProperty(o)) {
                                                if (o == e) for (const l in n) n.hasOwnProperty(l) && (i[l] = n[l]);
                                                n.hasOwnProperty(o) || (i[o] = a[o]);
                                        }
                                const s = t[r];
                                return (
                                        (t[r] = i),
                                        C.languages.DFS(C.languages, function(e, n) {
                                                n === s && e != r && (this[e] = i);
                                        }),
                                        i
                                );
                        },
                        DFS: function e(n, r, t, a) {
                                a = a || {};
                                const i = C.util.objId;
                                for (const o in n)
                                        if (n.hasOwnProperty(o)) {
                                                r.call(n, o, n[o], t || o);
                                                const l = n[o];
                                                const s = C.util.type(l);
                                                s !== 'Object' || a[i(l)]
                                                        ? s !== 'Array' || a[i(l)] || ((a[i(l)] = !0), e(l, r, o, a))
                                                        : ((a[i(l)] = !0), e(l, r, null, a));
                                        }
                        },
                },
                plugins: {},
                highlightAll(e, n) {
                        C.highlightAllUnder(document, e, n);
                },
                highlightAllUnder(e, n, r) {
                        const t = {
                                callback: r,
                                container: e,
                                selector:
                                        'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code',
                        };
                        C.hooks.run('before-highlightall', t),
                                (t.elements = Array.prototype.slice.apply(t.container.querySelectorAll(t.selector))),
                                C.hooks.run('before-all-elements-highlight', t);
                        for (var a, i = 0; (a = t.elements[i++]); ) C.highlightElement(a, !0 === n, t.callback);
                },
                highlightElement(e, n, r) {
                        const t = C.util.getLanguage(e);
                        const a = C.languages[t];
                        e.className = `${e.className.replace(c, '').replace(/\s+/g, ' ')} language-${t}`;
                        const i = e.parentNode;
                        i &&
                                i.nodeName.toLowerCase() === 'pre' &&
                                (i.className = `${i.className.replace(c, '').replace(/\s+/g, ' ')} language-${t}`);
                        const o = { element: e, language: t, grammar: a, code: e.textContent };
                        function l(e) {
                                (o.highlightedCode = e),
                                        C.hooks.run('before-insert', o),
                                        (o.element.innerHTML = o.highlightedCode),
                                        C.hooks.run('after-highlight', o),
                                        C.hooks.run('complete', o),
                                        r && r.call(o.element);
                        }
                        if ((C.hooks.run('before-sanity-check', o), !o.code))
                                return C.hooks.run('complete', o), void (r && r.call(o.element));
                        if ((C.hooks.run('before-highlight', o), o.grammar))
                                if (n && u.Worker) {
                                        const s = new Worker(C.filename);
                                        (s.onmessage = function(e) {
                                                l(e.data);
                                        }),
                                                s.postMessage(
                                                        JSON.stringify({
                                                                language: o.language,
                                                                code: o.code,
                                                                immediateClose: !0,
                                                        })
                                                );
                                } else l(C.highlight(o.code, o.grammar, o.language));
                        else l(C.util.encode(o.code));
                },
                highlight(e, n, r) {
                        const t = { code: e, grammar: n, language: r };
                        return (
                                C.hooks.run('before-tokenize', t),
                                (t.tokens = C.tokenize(t.code, t.grammar)),
                                C.hooks.run('after-tokenize', t),
                                _.stringify(C.util.encode(t.tokens), t.language)
                        );
                },
                matchGrammar(e, n, r, t, a, i, o) {
                        for (const l in r)
                                if (r.hasOwnProperty(l) && r[l]) {
                                        let s = r[l];
                                        s = Array.isArray(s) ? s : [s];
                                        for (let u = 0; u < s.length; ++u) {
                                                if (o && o == `${l},${u}`) return;
                                                let c = s[u];
                                                const g = c.inside;
                                                const f = !!c.lookbehind;
                                                const h = !!c.greedy;
                                                let d = 0;
                                                const m = c.alias;
                                                if (h && !c.pattern.global) {
                                                        const p = c.pattern.toString().match(/[imsuy]*$/)[0];
                                                        c.pattern = RegExp(c.pattern.source, `${p}g`);
                                                }
                                                c = c.pattern || c;
                                                for (let y = t, v = a; y < n.length; v += n[y].length, ++y) {
                                                        let k = n[y];
                                                        if (n.length > e.length) return;
                                                        if (!(k instanceof _)) {
                                                                if (h && y != n.length - 1) {
                                                                        if (((c.lastIndex = v), !(O = c.exec(e))))
                                                                                break;
                                                                        for (
                                                                                var b =
                                                                                                O.index +
                                                                                                (f && O[1]
                                                                                                        ? O[1].length
                                                                                                        : 0),
                                                                                        w = O.index + O[0].length,
                                                                                        A = y,
                                                                                        P = v,
                                                                                        x = n.length;
                                                                                A < x &&
                                                                                (P < w ||
                                                                                        (!n[A].type &&
                                                                                                !n[A - 1].greedy));
                                                                                ++A
                                                                        )
                                                                                (P += n[A].length) <= b &&
                                                                                        (++y, (v = P));
                                                                        if (n[y] instanceof _) continue;
                                                                        (S = A - y),
                                                                                (k = e.slice(v, P)),
                                                                                (O.index -= v);
                                                                } else {
                                                                        c.lastIndex = 0;
                                                                        var O = c.exec(k);
                                                                        var S = 1;
                                                                }
                                                                if (O) {
                                                                        f && (d = O[1] ? O[1].length : 0);
                                                                        w =
                                                                                (b = O.index + d) +
                                                                                (O = O[0].slice(d)).length;
                                                                        const j = k.slice(0, b);
                                                                        const N = k.slice(w);
                                                                        const E = [y, S];
                                                                        j && (++y, (v += j.length), E.push(j));
                                                                        const L = new _(
                                                                                l,
                                                                                g ? C.tokenize(O, g) : O,
                                                                                m,
                                                                                O,
                                                                                h
                                                                        );
                                                                        if (
                                                                                (E.push(L),
                                                                                N && E.push(N),
                                                                                Array.prototype.splice.apply(n, E),
                                                                                S != 1 &&
                                                                                        C.matchGrammar(
                                                                                                e,
                                                                                                n,
                                                                                                r,
                                                                                                y,
                                                                                                v,
                                                                                                !0,
                                                                                                `${l},${u}`
                                                                                        ),
                                                                                i)
                                                                        )
                                                                                break;
                                                                } else if (i) break;
                                                        }
                                                }
                                        }
                                }
                },
                tokenize(e, n) {
                        const r = [e];
                        const t = n.rest;
                        if (t) {
                                for (const a in t) n[a] = t[a];
                                delete n.rest;
                        }
                        return C.matchGrammar(e, r, n, 0, 0, !1), r;
                },
                hooks: {
                        all: {},
                        add(e, n) {
                                const r = C.hooks.all;
                                (r[e] = r[e] || []), r[e].push(n);
                        },
                        run(e, n) {
                                const r = C.hooks.all[e];
                                if (r && r.length) for (var t, a = 0; (t = r[a++]); ) t(n);
                        },
                },
                Token: _,
        };
        function _(e, n, r, t, a) {
                (this.type = e),
                        (this.content = n),
                        (this.alias = r),
                        (this.length = 0 | (t || '').length),
                        (this.greedy = !!a);
        }
        if (
                ((u.Prism = C),
                (_.stringify = function(e, n) {
                        if (typeof e === 'string') return e;
                        if (Array.isArray(e))
                                return e
                                        .map(function(e) {
                                                return _.stringify(e, n);
                                        })
                                        .join('');
                        const r = {
                                type: e.type,
                                content: _.stringify(e.content, n),
                                tag: 'span',
                                classes: ['token', e.type],
                                attributes: {},
                                language: n,
                        };
                        if (e.alias) {
                                const t = Array.isArray(e.alias) ? e.alias : [e.alias];
                                Array.prototype.push.apply(r.classes, t);
                        }
                        C.hooks.run('wrap', r);
                        const a = Object.keys(r.attributes)
                                .map(function(e) {
                                        return `${e}="${(r.attributes[e] || '').replace(/"/g, '&quot;')}"`;
                                })
                                .join(' ');
                        return `<${r.tag} class="${r.classes.join(' ')}"${a ? ` ${a}` : ''}>${r.content}</${r.tag}>`;
                }),
                !u.document)
        )
                return (
                        u.addEventListener &&
                                (C.disableWorkerMessageHandler ||
                                        u.addEventListener(
                                                'message',
                                                function(e) {
                                                        const n = JSON.parse(e.data);
                                                        const r = n.language;
                                                        const t = n.code;
                                                        const a = n.immediateClose;
                                                        u.postMessage(C.highlight(t, C.languages[r], r)),
                                                                a && u.close();
                                                },
                                                !1
                                        )),
                        C
                );
        const e = C.util.currentScript();
        if ((e && ((C.filename = e.src), e.hasAttribute('data-manual') && (C.manual = !0)), !C.manual)) {
                function r() {
                        C.manual || C.highlightAll();
                }
                const t = document.readyState;
                t === 'loading' || (t === 'interactive' && e && e.defer)
                        ? document.addEventListener('DOMContentLoaded', r)
                        : window.requestAnimationFrame
                        ? window.requestAnimationFrame(r)
                        : window.setTimeout(r, 16);
        }
        return C;
})(_self);
typeof module !== 'undefined' && module.exports && (module.exports = Prism),
        typeof global !== 'undefined' && (global.Prism = Prism);
(Prism.languages.markup = {
        comment: /<!--[\s\S]*?-->/,
        prolog: /<\?[\s\S]+?\?>/,
        doctype: {
                pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:(?!<!--)[^"'\]]|"[^"]*"|'[^']*'|<!--[\s\S]*?-->)*\]\s*)?>/i,
                greedy: !0,
        },
        cdata: /<!\[CDATA\[[\s\S]*?]]>/i,
        tag: {
                pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/i,
                greedy: !0,
                inside: {
                        tag: {
                                pattern: /^<\/?[^\s>\/]+/i,
                                inside: { punctuation: /^<\/?/, namespace: /^[^\s>\/:]+:/ },
                        },
                        'attr-value': {
                                pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/i,
                                inside: { punctuation: [/^=/, { pattern: /^(\s*)["']|["']$/, lookbehind: !0 }] },
                        },
                        punctuation: /\/?>/,
                        'attr-name': { pattern: /[^\s>\/]+/, inside: { namespace: /^[^\s>\/:]+:/ } },
                },
        },
        entity: /&#?[\da-z]{1,8};/i,
}),
        (Prism.languages.markup.tag.inside['attr-value'].inside.entity = Prism.languages.markup.entity),
        Prism.hooks.add('wrap', function(a) {
                a.type === 'entity' && (a.attributes.title = a.content.replace(/&amp;/, '&'));
        }),
        Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
                value(a, e) {
                        const s = {};
                        (s[`language-${e}`] = {
                                pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
                                lookbehind: !0,
                                inside: Prism.languages[e],
                        }),
                                (s.cdata = /^<!\[CDATA\[|\]\]>$/i);
                        const n = { 'included-cdata': { pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i, inside: s } };
                        n[`language-${e}`] = { pattern: /[\s\S]+/, inside: Prism.languages[e] };
                        const t = {};
                        (t[a] = {
                                pattern: RegExp(
                                        '(<__[\\s\\S]*?>)(?:<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\s*|[\\s\\S])*?(?=<\\/__>)'.replace(
                                                /__/g,
                                                a
                                        ),
                                        'i'
                                ),
                                lookbehind: !0,
                                greedy: !0,
                                inside: n,
                        }),
                                Prism.languages.insertBefore('markup', 'cdata', t);
                },
        }),
        (Prism.languages.xml = Prism.languages.extend('markup', {})),
        (Prism.languages.html = Prism.languages.markup),
        (Prism.languages.mathml = Prism.languages.markup),
        (Prism.languages.svg = Prism.languages.markup);
!(function(s) {
        const t = /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;
        (s.languages.css = {
                comment: /\/\*[\s\S]*?\*\//,
                atrule: { pattern: /@[\w-]+[\s\S]*?(?:;|(?=\s*\{))/, inside: { rule: /@[\w-]+/ } },
                url: {
                        pattern: RegExp(`url\\((?:${t.source}|[^\n\r()]*)\\)`, 'i'),
                        inside: { function: /^url/i, punctuation: /^\(|\)$/ },
                },
                selector: RegExp(`[^{}\\s](?:[^{};"']|${t.source})*?(?=\\s*\\{)`),
                string: { pattern: t, greedy: !0 },
                property: /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
                important: /!important\b/i,
                function: /[-a-z0-9]+(?=\()/i,
                punctuation: /[(){};:,]/,
        }),
                (s.languages.css.atrule.inside.rest = s.languages.css);
        const e = s.languages.markup;
        e &&
                (e.tag.addInlined('style', 'css'),
                s.languages.insertBefore(
                        'inside',
                        'attr-value',
                        {
                                'style-attr': {
                                        pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
                                        inside: {
                                                'attr-name': { pattern: /^\s*style/i, inside: e.tag.inside },
                                                punctuation: /^\s*=\s*['"]|['"]\s*$/,
                                                'attr-value': { pattern: /.+/i, inside: s.languages.css },
                                        },
                                        alias: 'language-css',
                                },
                        },
                        e.tag
                ));
})(Prism);
Prism.languages.clike = {
        comment: [
                { pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/, lookbehind: !0 },
                { pattern: /(^|[^\\:])\/\/.*/, lookbehind: !0, greedy: !0 },
        ],
        string: { pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: !0 },
        'class-name': {
                pattern: /(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,
                lookbehind: !0,
                inside: { punctuation: /[.\\]/ },
        },
        keyword: /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
        boolean: /\b(?:true|false)\b/,
        function: /\w+(?=\()/,
        number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
        operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
        punctuation: /[{}[\];(),.:]/,
};
(Prism.languages.javascript = Prism.languages.extend('clike', {
        'class-name': [
                Prism.languages.clike['class-name'],
                {
                        pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,
                        lookbehind: !0,
                },
        ],
        keyword: [
                { pattern: /((?:^|})\s*)(?:catch|finally)\b/, lookbehind: !0 },
                {
                        pattern: /(^|[^.])\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
                        lookbehind: !0,
                },
        ],
        number: /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,
        function: /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
        operator: /--|\+\+|\*\*=?|=>|&&|\|\||[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?[.?]?|[~:]/,
})),
        (Prism.languages.javascript[
                'class-name'
        ][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/),
        Prism.languages.insertBefore('javascript', 'keyword', {
                regex: {
                        pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=\s*(?:$|[\r\n,.;})\]]))/,
                        lookbehind: !0,
                        greedy: !0,
                },
                'function-variable': {
                        pattern: /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,
                        alias: 'function',
                },
                parameter: [
                        {
                                pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,
                                lookbehind: !0,
                                inside: Prism.languages.javascript,
                        },
                        {
                                pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,
                                inside: Prism.languages.javascript,
                        },
                        {
                                pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,
                                lookbehind: !0,
                                inside: Prism.languages.javascript,
                        },
                        {
                                pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,
                                lookbehind: !0,
                                inside: Prism.languages.javascript,
                        },
                ],
                constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/,
        }),
        Prism.languages.insertBefore('javascript', 'string', {
                'template-string': {
                        pattern: /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,
                        greedy: !0,
                        inside: {
                                'template-punctuation': { pattern: /^`|`$/, alias: 'string' },
                                interpolation: {
                                        pattern: /((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,
                                        lookbehind: !0,
                                        inside: {
                                                'interpolation-punctuation': {
                                                        pattern: /^\${|}$/,
                                                        alias: 'punctuation',
                                                },
                                                rest: Prism.languages.javascript,
                                        },
                                },
                                string: /[\s\S]+/,
                        },
                },
        }),
        Prism.languages.markup && Prism.languages.markup.tag.addInlined('script', 'javascript'),
        (Prism.languages.js = Prism.languages.javascript);
!(function(e) {
        e.languages.pug = {
                comment: { pattern: /(^([\t ]*))\/\/.*(?:(?:\r?\n|\r)\2[\t ]+.+)*/m, lookbehind: !0 },
                'multiline-script': {
                        pattern: /(^([\t ]*)script\b.*\.[\t ]*)(?:(?:\r?\n|\r(?!\n))(?:\2[\t ]+.+|\s*?(?=\r?\n|\r)))+/m,
                        lookbehind: !0,
                        inside: e.languages.javascript,
                },
                filter: {
                        pattern: /(^([\t ]*)):.+(?:(?:\r?\n|\r(?!\n))(?:\2[\t ]+.+|\s*?(?=\r?\n|\r)))+/m,
                        lookbehind: !0,
                        inside: { 'filter-name': { pattern: /^:[\w-]+/, alias: 'variable' } },
                },
                'multiline-plain-text': {
                        pattern: /(^([\t ]*)[\w\-#.]+\.[\t ]*)(?:(?:\r?\n|\r(?!\n))(?:\2[\t ]+.+|\s*?(?=\r?\n|\r)))+/m,
                        lookbehind: !0,
                },
                markup: { pattern: /(^[\t ]*)<.+/m, lookbehind: !0, inside: e.languages.markup },
                doctype: { pattern: /((?:^|\n)[\t ]*)doctype(?: .+)?/, lookbehind: !0 },
                'flow-control': {
                        pattern: /(^[\t ]*)(?:if|unless|else|case|when|default|each|while)\b(?: .+)?/m,
                        lookbehind: !0,
                        inside: {
                                each: {
                                        pattern: /^each .+? in\b/,
                                        inside: { keyword: /\b(?:each|in)\b/, punctuation: /,/ },
                                },
                                branch: { pattern: /^(?:if|unless|else|case|when|default|while)\b/, alias: 'keyword' },
                                rest: e.languages.javascript,
                        },
                },
                keyword: { pattern: /(^[\t ]*)(?:block|extends|include|append|prepend)\b.+/m, lookbehind: !0 },
                mixin: [
                        {
                                pattern: /(^[\t ]*)mixin .+/m,
                                lookbehind: !0,
                                inside: { keyword: /^mixin/, function: /\w+(?=\s*\(|\s*$)/, punctuation: /[(),.]/ },
                        },
                        {
                                pattern: /(^[\t ]*)\+.+/m,
                                lookbehind: !0,
                                inside: {
                                        name: { pattern: /^\+\w+/, alias: 'function' },
                                        rest: e.languages.javascript,
                                },
                        },
                ],
                script: {
                        pattern: /(^[\t ]*script(?:(?:&[^(]+)?\([^)]+\))*[\t ]+).+/m,
                        lookbehind: !0,
                        inside: e.languages.javascript,
                },
                'plain-text': {
                        pattern: /(^[\t ]*(?!-)[\w\-#.]*[\w\-](?:(?:&[^(]+)?\([^)]+\))*\/?[\t ]+).+/m,
                        lookbehind: !0,
                },
                tag: {
                        pattern: /(^[\t ]*)(?!-)[\w\-#.]*[\w\-](?:(?:&[^(]+)?\([^)]+\))*\/?:?/m,
                        lookbehind: !0,
                        inside: {
                                attributes: [
                                        { pattern: /&[^(]+\([^)]+\)/, inside: e.languages.javascript },
                                        {
                                                pattern: /\([^)]+\)/,
                                                inside: {
                                                        'attr-value': {
                                                                pattern: /(=\s*)(?:\{[^}]*\}|[^,)\r\n]+)/,
                                                                lookbehind: !0,
                                                                inside: e.languages.javascript,
                                                        },
                                                        'attr-name': /[\w-]+(?=\s*!?=|\s*[,)])/,
                                                        punctuation: /[!=(),]+/,
                                                },
                                        },
                                ],
                                punctuation: /:/,
                        },
                },
                code: [{ pattern: /(^[\t ]*(?:-|!?=)).+/m, lookbehind: !0, inside: e.languages.javascript }],
                punctuation: /[.\-!=|]+/,
        };
        for (
                var t = [
                                { filter: 'atpl', language: 'twig' },
                                { filter: 'coffee', language: 'coffeescript' },
                                'ejs',
                                'handlebars',
                                'less',
                                'livescript',
                                'markdown',
                                { filter: 'sass', language: 'scss' },
                                'stylus',
                        ],
                        n = {},
                        a = 0,
                        i = t.length;
                a < i;
                a++
        ) {
                let r = t[a];
                (r = typeof r === 'string' ? { filter: r, language: r } : r),
                        e.languages[r.language] &&
                                (n[`filter-${r.filter}`] = {
                                        pattern: RegExp(
                                                '(^([\t ]*)):{{filter_name}}(?:(?:\r?\n|\r(?!\n))(?:\\2[\t ]+.+|\\s*?(?=\r?\n|\r)))+'.replace(
                                                        '{{filter_name}}',
                                                        r.filter
                                                ),
                                                'm'
                                        ),
                                        lookbehind: !0,
                                        inside: {
                                                'filter-name': { pattern: /^:[\w-]+/, alias: 'variable' },
                                                rest: e.languages[r.language],
                                        },
                                });
        }
        e.languages.insertBefore('pug', 'filter', n);
})(Prism);
