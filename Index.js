const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const sharp = require('sharp');

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR CODE:\n', qr);
});

client.on('ready', () => {
    console.log('Bot online!');
});

client.on('message', async message => {

    if (message.body === '!sticker' && message.hasQuotedMsg) {

        const quoted = await message.getQuotedMessage();

        if (quoted.hasMedia) {
            const media = await quoted.downloadMedia();

            if (media.mimetype.includes('image')) {

                const buffer = Buffer.from(media.data, 'base64');

                const stickerBuffer = await sharp(buffer)
                    .resize(512, 512, { fit: 'contain' })
                    .webp()
                    .toBuffer();

                const stickerMedia = new MessageMedia(
                    'image/webp',
                    stickerBuffer.toString('base64')
                );

                await client.sendMessage(message.from, stickerMedia, {
                    sendMediaAsSticker: true
                });
            }
        }
    }
});

client.initialize();
