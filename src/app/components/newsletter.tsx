import React, { useState } from 'react';

const Newsletter: React.FC = () => {
    const [email, setEmail] = useState('');

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here (e.g., send email to server)
        console.log('Email:', email);
        setEmail('');
    };

    return (
        <div className="newsletter-container bg-gray-100 p-4 rounded-lg">
          <h2 className="newsletter-title text-2xl font-bold mb-4">Join Our Newsletter</h2>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              className="newsletter-input border border-gray-300 rounded-lg py-2 px-4 mb-2 w-full"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
            />
            <button className="newsletter-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg" type="submit">Subscribe</button>
          </form>
        </div>
    );
};

export default Newsletter;