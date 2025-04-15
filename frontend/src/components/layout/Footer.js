import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3>Đăng ký nhận tin khuyến mãi</h3>
              <p>Nhận thông tin ưu đãi và sản phẩm mới nhất từ Chợ Việt</p>
            </div>
            <form className="newsletter-form">
              <div className="form-group">
                <input type="email" placeholder="Nhập địa chỉ email của bạn" required />
                <button type="submit">
                  <span>Đăng ký</span>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="container">
          <div className="footer-widgets">
            <div className="footer-widget about-widget">
              <div className="footer-logo">
                <Link to="/">
                  <span className="logo-text">Chợ Việt</span>
                </Link>
              </div>
              <p className="footer-about">
                Nền tảng mua bán trực tuyến hàng đầu, kết nối người mua và người bán tại Việt Nam với hàng triệu sản phẩm đa dạng và chất lượng.
              </p>
              <div className="footer-social">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>

            <div className="footer-widget links-widget">
              <h4 className="widget-title">Mua sắm</h4>
              <ul className="widget-links">
                <li><Link to="/category/dien-thoai">Điện thoại</Link></li>
                <li><Link to="/category/laptop">Máy tính</Link></li>
                <li><Link to="/category/thoi-trang">Thời trang</Link></li>
                <li><Link to="/category/do-dien-tu">Điện tử</Link></li>
                <li><Link to="/category/nha-cua">Nhà cửa</Link></li>
                <li><Link to="/category/all">Tất cả danh mục</Link></li>
              </ul>
            </div>

            <div className="footer-widget links-widget">
              <h4 className="widget-title">Hỗ trợ khách hàng</h4>
              <ul className="widget-links">
                <li><Link to="/help-center">Trung tâm trợ giúp</Link></li>
                <li><Link to="/how-to-buy">Hướng dẫn mua hàng</Link></li>
                <li><Link to="/how-to-sell">Bán hàng trên Chợ Việt</Link></li>
                <li><Link to="/safety-tips">Mẹo an toàn</Link></li>
                <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
                <li><Link to="/contact">Liên hệ hỗ trợ</Link></li>
              </ul>
            </div>

            <div className="footer-widget links-widget">
              <h4 className="widget-title">Về Chợ Việt</h4>
              <ul className="widget-links">
                <li><Link to="/about">Giới thiệu</Link></li>
                <li><Link to="/careers">Tuyển dụng</Link></li>
                <li><Link to="/terms">Điều khoản sử dụng</Link></li>
                <li><Link to="/privacy">Chính sách bảo mật</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/seller-center">Kênh người bán</Link></li>
              </ul>
            </div>

            <div className="footer-widget contact-widget">
              <h4 className="widget-title">Thông tin liên hệ</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <p>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                </div>
                <div className="contact-item">
                  <i className="fas fa-phone-alt"></i>
                  <p>
                    Hotline: <a href="tel:1900123456">1900 1234 56</a><br />
                    Hỗ trợ: <a href="tel:0283123456">028 3123 4567</a>
                  </p>
                </div>
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <p>
                    <a href="mailto:support@choviet.vn">support@choviet.vn</a><br />
                    <a href="mailto:contact@choviet.vn">contact@choviet.vn</a>
                  </p>
                </div>
              </div>
              
              <div className="download-apps">
                <h5>Tải ứng dụng</h5>
                <div className="app-buttons">
                  <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">
                    <img src="/images/google-play-badge.png" alt="Google Play" onError={(e) => {e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg'}} />
                  </a>
                  <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer">
                    <img src="/images/app-store-badge.png" alt="App Store" onError={(e) => {e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg'}} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="copyright">
              © {currentYear} Chợ Việt. Tất cả quyền được bảo lưu.
            </div>
            <div className="payment-methods">
              <p>Chấp nhận thanh toán qua:</p>
              <div className="payment-icons">
                <i className="fab fa-cc-visa"></i>
                <i className="fab fa-cc-mastercard"></i>
                <i className="fab fa-cc-paypal"></i>
                <i className="fab fa-cc-jcb"></i>
                <i className="fab fa-cc-apple-pay"></i>
                <img src="/images/momo-icon.png" alt="MoMo" className="payment-img" onError={(e) => {e.target.style.display='none'}} />
                <img src="/images/zalopay-icon.png" alt="ZaloPay" className="payment-img" onError={(e) => {e.target.style.display='none'}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
