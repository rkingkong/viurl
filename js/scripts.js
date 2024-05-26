document.addEventListener('DOMContentLoaded', function() {
    const natural = require('natural');
    const tokenizer = new natural.WordTokenizer();
    const positiveWords = ['happy', 'great', 'excellent', 'good', 'positive'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'negative'];
    const forbiddenWords = ['badword1', 'badword2', 'inappropriate1', 'inappropriate2']; // Add more as needed

    function analyzeSentiment(text) {
        const tokens = tokenizer.tokenize(text);
        let sentimentScore = 0;

        tokens.forEach(token => {
            if (positiveWords.includes(token.toLowerCase())) {
                sentimentScore += 1;
            } else if (negativeWords.includes(token.toLowerCase())) {
                sentimentScore -= 1;
            }
        });

        return sentimentScore;
    }

    function moderateContent(text) {
        const tokens = tokenizer.tokenize(text);
        for (let token of tokens) {
            if (forbiddenWords.includes(token.toLowerCase())) {
                return false;
            }
        }
        return true;
    }

    function rewardPost(interactionType, sentimentScore) {
        let tokens = 0;
        let tokenType = '';

        if (interactionType === 'like') {
            tokens = sentimentScore > 0 ? 10 : 5; // Reward more for positive sentiment
            tokenType = 'likeToken';
        } else if (interactionType === 'share') {
            tokens = sentimentScore > 0 ? 15 : 10; // Reward more for positive sentiment
            tokenType = 'shareToken';
        } else if (interactionType === 'dislike') {
            tokens = sentimentScore < 0 ? 5 : 2; // Reward more for negative sentiment
            tokenType = 'dislikeToken';
        }

        console.log(`Rewarding ${tokens} ${tokenType}s`);
        try {
            const receipt = await rewardUser(userAddress, tokenType, tokens);
            console.log('Transaction receipt:', receipt);
            alert(`You earned ${tokens} ${tokenType}s!`);
        } catch (error) {
            console.error('Error rewarding user:', error);
            alert('Error processing reward transaction.');
        }
        // Here, integrate with blockchain API to mint/transfer tokens
        return { tokens, tokenType };
    }
    feed.addEventListener('click', async function(e) {
        if (e.target.classList.contains('like') || e.target.classList.contains('comment') || e.target.classList.contains('share')) {
            const postContent = e.target.closest('.post').querySelector('.content p').innerText;
            const interactionType = e.target.classList.contains('like') ? 'like' : e.target.classList.contains('share') ? 'share' : 'dislike';
            const userAddress = '0xUserAddress'; // Replace with actual user address
    
            const sentimentScore = analyzeSentiment(postContent);
            const isContentAllowed = moderateContent(postContent);
    
            if (isContentAllowed) {
                await rewardPost(interactionType, sentimentScore, userAddress);
            } else {
                alert('This post contains inappropriate content and cannot be rewarded.');
            }
    
            e.target.innerText = interactionType.charAt(0).toUpperCase() + interactionType.slice(1) + 'd';
        }
    });

    const postButton = document.getElementById('postButton');
    const postContent = document.getElementById('postContent');
    const feed = document.getElementById('feed');
    const addPostButton = document.getElementById('addPostButton');

    if (postButton) {
        postButton.addEventListener('click', function() {
            const content = postContent.value;
            if (content.trim() !== '') {
                const sentimentScore = analyzeSentiment(content);
                const isContentAllowed = moderateContent(content);

                if (isContentAllowed) {
                    const postElement = document.createElement('div');
                    postElement.className = 'post';
                    postElement.innerHTML = `
                        <div class="avatar"></div>
                        <div class="content">
                            <p>${content}</p>
                            <div class="post-actions">
                                <button class="like">Like</button>
                                <button class="comment">Comment</button>
                                <button class="share">Share</button>
                            </div>
                        </div>
                    `;
                    feed.prepend(postElement);
                    postContent.value = '';
                } else {
                    alert('This post contains inappropriate content and cannot be posted.');
                }
            } else {
                alert('Post content cannot be empty.');
            }
        });
    }

    feed.addEventListener('click', function(e) {
        if (e.target.classList.contains('like') || e.target.classList.contains('comment') || e.target.classList.contains('share')) {
            const postContent = e.target.closest('.post').querySelector('.content p').innerText;
            const interactionType = e.target.classList.contains('like') ? 'like' : e.target.classList.contains('share') ? 'share' : 'dislike';

            const sentimentScore = analyzeSentiment(postContent);
            const isContentAllowed = moderateContent(postContent);

            if (isContentAllowed) {
                const { tokens, tokenType } = rewardPost(interactionType, sentimentScore);
                alert(`You earned ${tokens} ${tokenType}s!`);
            } else {
                alert('This post contains inappropriate content and cannot be rewarded.');
            }

            e.target.innerText = interactionType.charAt(0).toUpperCase() + interactionType.slice(1) + 'd';
        }
    });

    // Profile Page functionality
    const profileFeed = document.getElementById('profile-feed');
    if (profileFeed) {
        const userPosts = [
            "User's first post content",
            "User's second post content",
            "User's third post content"
        ];

        userPosts.forEach(content => {
            const newPost = document.createElement('div');
            newPost.classList.add('post');
            newPost.innerHTML = `
                <div class="avatar"></div>
                <div class="content">
                    <p>${content}</p>
                    <div class="post-actions">
                        <button class="like">Like</button>
                        <button class="comment">Comment</button>
                        <button class="share">Share</button>
                    </div>
                </div>
            `;
            profileFeed.appendChild(newPost);
        });
    }

    // Edit Profile functionality
    const editProfileButton = document.getElementById('editProfileButton');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeButton = document.querySelector('.close-button');
    const saveProfileButton = document.getElementById('saveProfileButton');
    const userNameInput = document.getElementById('userName');
    const userBioTextarea = document.getElementById('userBio');

    if (editProfileButton && editProfileModal && closeButton && saveProfileButton && userNameInput && userBioTextarea) {
        editProfileButton.addEventListener('click', () => {
            editProfileModal.style.display = 'block';
        });

        closeButton.addEventListener('click', () => {
            editProfileModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target == editProfileModal) {
                editProfileModal.style.display = 'none';
            }
        });

        saveProfileButton.addEventListener('click', () => {
            const newName = userNameInput.value;
            const newBio = userBioTextarea.value;

            document.querySelector('.bio h1').innerText = newName;
            document.querySelector('.bio p').innerText = newBio;

            editProfileModal.style.display = 'none';
        });
    }

    // Notifications functionality
    const notifications = document.getElementById('notifications');
    if (notifications) {
        const notificationData = [
            { type: 'like', user: 'User A', content: 'liked your post.' },
            { type: 'comment', user: 'User B', content: 'commented on your post.' },
            { type: 'follow', user: 'User C', content: 'started following you.' }
        ];

        notificationData.forEach(notification => {
            const newNotification = document.createElement('div');
            newNotification.classList.add('notification');
            newNotification.classList.add(notification.type);
            newNotification.innerHTML = `
                <div class="avatar"></div>
                <div class="content">
                    <p><strong>${notification.user}</strong> ${notification.content}</p>
                </div>
                <div class="actions">
                    <button>View</button>
                </div>
            `;
            notifications.appendChild(newNotification);
        });
    }

    // Messages functionality
    const messageThreads = document.getElementById('messageThreads');
    const messageView = document.getElementById('messageView');
    const messageContent = document.getElementById('messageContent');
    const messageInput = document.getElementById('messageInput');
    const sendMessageButton = document.getElementById('sendMessageButton');
    const chatWith = document.getElementById('chatWith');

    if (messageThreads && messageView && messageContent && messageInput && sendMessageButton) {
        const threads = [
            { user: 'User A', messages: ['Hello!', 'How are you?', 'Goodbye!'] },
            { user: 'User B', messages: ['Hi!', 'What\'s up?', 'See you later!'] },
        ];

        let activeThread = null;

        threads.forEach((thread, index) => {
            const threadElement = document.createElement('div');
            threadElement.classList.add('message-thread');
            threadElement.innerHTML = `<strong>${thread.user}</strong>`;
            threadElement.addEventListener('click', () => {
                activeThread = index;
                chatWith.innerText = thread.user;
                messageContent.innerHTML = '';
                thread.messages.forEach((msg, i) => {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('message', i % 2 === 0 ? 'sent' : 'received');
                    messageElement.innerText = msg;
                    messageContent.appendChild(messageElement);
                });
            });
            messageThreads.appendChild(threadElement);
        });

        sendMessageButton.addEventListener('click', () => {
            const message = messageInput.value;
            if (message.trim() === '') {
                alert('Message content cannot be empty');
                return;
            }

            if (activeThread !== null) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', 'sent');
                messageElement.innerText = message;
                messageContent.appendChild(messageElement);
                threads[activeThread].messages.push(message);
                messageInput.value = '';
            }
        });
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    if (searchInput && searchButton && searchResults) {
        const users = ['User A', 'User B', 'User C', 'User D'];
        const posts = [
            'First post by User A',
            'Second post by User B',
            'Third post by User C',
            'Fourth post by User D'
        ];

        searchButton.addEventListener('click', () => {
            const query = searchInput.value.toLowerCase();
            searchResults.innerHTML = '';

            if (query.trim() === '') {
                alert('Search query cannot be empty');
                return;
            }

            const filteredUsers = users.filter(user => user.toLowerCase().includes(query));
            const filteredPosts = posts.filter(post => post.toLowerCase().includes(query));

            if (filteredUsers.length === 0 && filteredPosts.length === 0) {
                searchResults.innerHTML = '<p>No results found.</p>';
                return;
            }

            filteredUsers.forEach(user => {
                const userResult = document.createElement('div');
                userResult.classList.add('search-result');
                userResult.innerHTML = `<p>${user}</p>`;
                searchResults.appendChild(userResult);
            });

            filteredPosts.forEach(post => {
                const postResult = document.createElement('div');
                postResult.classList.add('search-result');
                postResult.innerHTML = `<p>${post}</p>`;
                searchResults.appendChild(postResult);
            });
        });
    }

    // Settings functionality
    const settingsUsername = document.getElementById('settingsUsername');
    const settingsEmail = document.getElementById('settingsEmail');
    const saveSettingsButton = document.getElementById('saveSettingsButton');

    if (settingsUsername && settingsEmail && saveSettingsButton) {
        saveSettingsButton.addEventListener('click', () => {
            const newUsername = settingsUsername.value;
            const newEmail = settingsEmail.value;

            if (newUsername.trim() === '' || newEmail.trim() === '') {
                alert('Username and email cannot be empty');
                return;
            }

            alert(`Settings saved:\nUsername: ${newUsername}\nEmail: ${newEmail}`);
        });
    }

    // Rewards functionality
    const totalTokens = document.getElementById('totalTokens');
    const totalLikes = document.getElementById('totalLikes');
    const totalDislikes = document.getElementById('totalDislikes');
    const redeemRewardsButton = document.getElementById('redeemRewardsButton');

    if (totalTokens && totalLikes && totalDislikes && redeemRewardsButton) {
        let tokens = 0;
        let likes = 0;
        let dislikes = 0;

        // Example logic to increment tokens, likes, and dislikes
        likes += 10;
        dislikes += 5;
        tokens = likes - dislikes;

        totalTokens.innerText = tokens;
        totalLikes.innerText = likes;
        totalDislikes.innerText = dislikes;

        redeemRewardsButton.addEventListener('click', () => {
            alert(`You have redeemed ${tokens} tokens!`);
            tokens = 0;
            likes = 0;
            dislikes = 0;
            totalTokens.innerText = tokens;
            totalLikes.innerText = likes;
            totalDislikes.innerText = dislikes;
        });
    }

    // Login functionality
    const loginForm = document.getElementById('loginForm');
    const signInWithGoogle = document.getElementById('signInWithGoogle');
    const signInWithApple = document.getElementById('signInWithApple');
    const signInWithWallet = document.getElementById('signInWithWallet');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            alert(`Login form submitted with email: ${email}`);
            // Add your login logic here
        });
    }

    if (signInWithGoogle) {
        signInWithGoogle.addEventListener('click', () => {
            alert('Sign in with Google clicked');
            // Add your Google sign-in logic here
        });
    }

    if (signInWithApple) {
        signInWithApple.addEventListener('click', () => {
            alert('Sign in with Apple clicked');
            // Add your Apple sign-in logic here
        });
    }

    if (signInWithWallet) {
        signInWithWallet.addEventListener('click', () => {
            alert('Sign in with Wallet clicked');
            // Add your Wallet sign-in logic here
        });
    }
});
