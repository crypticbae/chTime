# 🕐 chTime - Professional Time Tracking

A modern, bilingual time tracking application built with Next.js. Track your work hours with precision and export detailed PDF reports.

## ✨ Features

- ⏰ **Real-time Clock In/Out** - Track work and break times
- 🌍 **Bilingual Support** - English and German interface
- 📊 **Daily Summaries** - Detailed work time analytics
- 📄 **PDF Export** - Professional time reports
- 👥 **Multi-user Support** - User management with admin controls
- 🎯 **Work Goals** - Set and track daily work targets
- 🌙 **Dark/Light Theme** - Modern UI with theme switching
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔒 **Privacy-focused** - Data stored locally in browser

## 🚀 Quick Start with Docker

### Option 1: Using Pre-built Image (Recommended)

```bash
# Pull and run the latest version
docker run -d \
  --name chtime \
  -p 7777:3000 \
  --restart unless-stopped \
  ghcr.io/crypticbae/chtime:latest

# Access at http://localhost:7777
```

### Option 2: Using Docker Compose

```bash
# Download the compose file
curl -o docker-compose.yml https://raw.githubusercontent.com/crypticbae/chTime/master/docker-compose.prod.yml

# Start the application
docker-compose up -d
```

### Option 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/crypticbae/chTime.git
cd chTime

# Build and run with Docker Compose
docker-compose up -d --build
```

## 📋 Requirements

- **Docker** (v20.10 or later)
- **Docker Compose** (v2.0 or later)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🔧 Configuration

### Environment Variables

Create a `.env` file to customize your deployment:

```env
# Application settings
NODE_ENV=production
PORT=3000

# Disable telemetry
NEXT_TELEMETRY_DISABLED=1
```

### Custom Port

To run on a different port:

```bash
docker run -p 8888:3000 ghcr.io/crypticbae/chtime:latest
```

## 📖 Detailed Documentation

- **[Docker Deployment Guide](./README-Docker.md)** - Complete Docker setup instructions
- **[User Guide](#usage)** - How to use chTime
- **[Admin Guide](#admin-features)** - Admin panel and user management

## 🎯 Usage

### Basic Time Tracking

1. **Register/Login** - Create your account or log in
2. **Clock In** - Start tracking your work time
3. **Take Breaks** - Use break tracking for accurate reports
4. **Clock Out** - End your work session
5. **View Summary** - Check daily/weekly reports
6. **Export PDF** - Generate professional time reports

### Admin Features

- **User Management** - Add/remove users and assign admin roles
- **Registration Control** - Enable/disable new user registration
- **Timestamp Editing** - Modify time entries when needed
- **System Overview** - Monitor application usage

## 🌍 Language Support

Switch between English and German in the top-right corner. All features including PDF exports adapt to your selected language.

## 💾 Data Storage

chTime uses browser-based IndexedDB for data storage:

- ✅ **Privacy-focused** - All data stays on the user's device
- ✅ **No server database required** - Simplified deployment
- ⚠️ **User responsibility** - Users should regularly export their data
- ⚠️ **Device-specific** - Data doesn't sync between devices

## 🔄 Updates

### Docker Users

```bash
# Pull latest version
docker pull ghcr.io/crypticbae/chtime:latest

# Restart container
docker stop chtime && docker rm chtime
docker run -d --name chtime -p 7777:3000 ghcr.io/crypticbae/chtime:latest

# Or with docker-compose
docker-compose pull && docker-compose up -d
```

## 🛠️ Development

### Local Development

```bash
# Clone repository
git clone https://github.com/crypticbae/chTime.git
cd chTime

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

### Building

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🐳 Docker Development

```bash
# Build Docker image locally
docker build -t chtime:dev .

# Run development container
docker run -p 7777:3000 chtime:dev

# Or use the build script
./scripts/docker-build.sh
```

## 📊 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Storage**: IndexedDB (browser-based)
- **PDF Generation**: jsPDF, html2canvas
- **Deployment**: Docker, GitHub Actions
- **Build**: Multi-stage Docker builds for optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

- **Port already in use**: Change the port mapping `-p 8888:3000`
- **Container won't start**: Check Docker logs with `docker logs chtime`
- **Data loss**: Regular PDF exports are recommended for backup

### Getting Help

- 🐛 **Bug Reports**: [Create an issue](https://github.com/crypticbae/chTime/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/crypticbae/chTime/discussions)
- 📧 **GitHub**: [@crypticbae](https://github.com/crypticbae)

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Date handling with [date-fns](https://date-fns.org/)

---

**⭐ If you find chTime useful, please give it a star!** 