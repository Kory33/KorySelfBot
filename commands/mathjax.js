'use strict';
const Command = require("./command");
const mjAPI = require("mathjax-node");
const gm = require("gm");
const stream = require("stream");
const svgexport = require('svgexport');

function getEquationSVGFromSource(source) {
    return new Promise((resolve, reject) => {
        mjAPI.typeset({
            "math": source,
            "format": "TeX",
            "svg": true
        }, data => {
            if (data.errors) {
                reject(data.errors);
            }
            resolve(data.svg);
        });
    });
}

function getJpgFromSvg(svgSource) {
    const processedSource = `<?xml version="1.1" encoding="UTF-8" standalone="no"?>` + svgSource;
    return new Promise((resolve, reject) => {
        try {
            resolve(
                gm(Buffer.from(processedSource), "svg.svg").options({
                    imageMagick: true
                })
                .setFormat("jpg")
                .stream()
            );
        } catch (error) {
            reject(error);
        }
    });
}

class MathJaxCommand extends Command {
    run() {
        const source = this.args.join(" ");

        if (source.replace(/^\s*|\s*$/g, "") === "") {
            return Promise.reject("Mathjax: arguments missing!");
        }

        const channel = this.event.message.channel;
        return Promise.all([
                channel.sendMessage(`\`\`\`Generating mathjax image with the given mathjax text: ${source}\`\`\``),
                getEquationSVGFromSource(source)
                .then(svg => getJpgFromSvg(svg))
            ])
            .then(([genMessage, jpgImageData]) => Promise.all([
                genMessage.delete(),
                channel.sendMessage(`\`\`\`Generated the image, uploading it...\`\`\``),
                channel.uploadFile(jpgImageData, "equation.jpg", "")
            ]))
            .then(([, uploadingMessage]) => uploadingMessage.delete())
            .catch(error => Promise.reject(`Error while handing process with mathjax: ${error}`));
    }
}

module.exports = MathJaxCommand