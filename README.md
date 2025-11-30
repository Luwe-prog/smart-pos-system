# ButterBean Cafe 🏪

A modern Point of Sale system with QR receipt generation and comprehensive sales analytics, built for café management.

## 🌟 Features

- **POS Interface**: Fast and intuitive product selection and checkout
- **QR Receipts**: Digital receipts with scannable QR codes
- **Sales Analytics**: Real-time dashboard with charts and insights
- **Inventory Management**: Track stock levels with low-stock alerts
- **User Management**: Role-based access (Admin/Cashier)
- **Reports**: Export sales reports to PDF and CSV
- **Multi-currency**: Philippine Peso (₱) support

## 🛠️ Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS
- Recharts (Data visualization)
- Axios (API client)
- jsPDF (PDF generation)
- Lucide React (Icons)

### Backend
- Laravel 12 (PHP)
- MySQL Database
- Laravel Sanctum (Authentication)
- Endroid QR Code (QR generation)

## 📋 Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18.x
- MySQL >= 8.0
- XAMPP or similar local server

## 🚀 Installation

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/smart-pos-system.git
cd smart-pos-system/backend
```

2. Install dependencies:
```bash
composer install
```

3. Configure environment:
```bash
cp .env.example .env
php artisan key:generate
```

4. Update `.env` with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smart_pos
DB_USERNAME=root
DB_PASSWORD=your_password
```

5. Run migrations:
```bash
php artisan migrate
```

6. Create storage link:
```bash
php artisan storage:link
```

7. Seed database (optional):
```bash
php artisan db:seed
```

8. Start the server:
```bash
php artisan serve
```

Backend will run at: `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
echo "VITE_API_URL=http://localhost:8000/api" > .env
```

4. Start development server:
```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`

## 👤 Default Login Credentials

**Admin Account:**
- Email: `admin@cafe.com`
- Password: `password`

**Cashier Account:**
- Email: `cashier@cafe.com`
- Password: `password`

## 📸 Screenshots

[Add screenshots here]

## 🗂️ Project Structure
```
smart-pos-system/
├── backend/           # Laravel API
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
├── frontend/          # React App
│   ├── src/
│   ├── public/
│   └── ...
└── README.md
```

## 🔐 Security

- Passwords are hashed using bcrypt
- API protected with Laravel Sanctum
- CSRF protection enabled
- Role-based middleware (Admin/Cashier)
- Input validation and sanitization

## 📊 Database Schema

### Users
- Stores user accounts with roles (admin/cashier)

### Products
- Product catalog with pricing and inventory

### Sales
- Transaction records with QR receipts

### Sale Items
- Individual items per transaction

### Inventory Logs
- Track all stock movements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open-source and available under the MIT License.

## 👨‍💻 Author

Your Name - [Your GitHub Profile](https://github.com/Luwe-prog)

## 🙏 Acknowledgments

- Built with Laravel and React
- Inspired by modern POS systems
- Icons by Lucide React