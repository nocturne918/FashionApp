// Custom footer used on the homepage 

import fitted from '../assets/fitted.png';

function Footer() {
    return (
        <footer className="home-footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <img src={fitted} alt="FITTED" className="footer-logo" />
                </div>
                {/* Four-column layout */}
                <div className="footer-columns">
                    <div className="footer-col">
                        <h4>Info</h4>
                        <ul>
                    
                            <li>About Us</li>
                            <li>Contact Us</li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Support</h4>
                        <ul>
                            <li>FAQs</li>
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Connect</h4>
                        <ul>
                            <li>Instagram</li>
                            <li>Facebook</li>
                            <li>YouTube</li>
                            <li>TikTok</li>
                        </ul>
                    </div>
                    <div className="footer-col wide">
                        <h4>feedback</h4>
                        <p>Let us know what you think.</p>
                        {/*  wire up to a backend to collect feedback  */}
                        <div className="feedback">
                            <input placeholder="Enter your feedback" />
                            <button>Submit</button>
                        </div>
                    </div>
                </div>
                {/* Copyright strip at the  bottom */}
                <div className="footer-copy">© {new Date().getFullYear()} FITTED. All rights reserved.</div>
            </div>
        </footer>
    );
}

export default Footer;
