document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const thumbnailImg = document.getElementById('thumbnailImg');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn'); // Added download button reference

    urlInput.addEventListener('input', async () => {
        const url = urlInput.value.trim();
        if (!url) {
            hideThumbnail();
            return;
        }

        try {
            const videoId = getYouTubeVideoId(url);
            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }

            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            displayThumbnail(thumbnailUrl);
        } catch (error) {
            console.error('Error fetching YouTube thumbnail:', error.message);
            hideThumbnail();
        }
    });

    convertBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) return;

        convertBtn.disabled = true;
        convertBtn.textContent = 'Converting...';

        try {
            const response = await fetch('/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error('Failed to convert video');
            }

            const data = await response.json();

            if (data.success) {
                showStatus('Conversion successful', true);
                showDownloadLink(data.downloadUrl, data.videoTitle); // Pass video title to showDownloadLink
            } else {
                showStatus('Failed to convert video', false);
            }
        } catch (error) {
            console.error('Error:', error);
            showStatus('An error occurred', false);
        } finally {
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert to MP3';
        }
    });

    function displayThumbnail(thumbnailUrl) {
        thumbnailImg.src = thumbnailUrl;
        thumbnailContainer.classList.remove('hidden');
    }

    function hideThumbnail() {
        thumbnailContainer.classList.add('hidden');
        thumbnailImg.src = '';
    }

    function showStatus(message, success) {
        const statusElem = document.getElementById('status');
        statusElem.textContent = message;
        statusElem.classList.remove('hidden');
        statusElem.classList.toggle('visible', success);
    }

    function showDownloadLink(url, videoTitle) {
        const downloadLinkElem = document.getElementById('downloadLink');
        const downloadBtnElem = document.getElementById('downloadBtn');

        // Set the href attribute to the download URL
        downloadBtnElem.href = url;
        
        // Set the download attribute to the video title
        downloadBtnElem.setAttribute('download', `${videoTitle}.mp3`);

        downloadLinkElem.classList.remove('hidden');
    }

    function getYouTubeVideoId(url) {
        const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regExp);
        return match ? match[1] : null;
    }
});
