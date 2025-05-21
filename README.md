# Shopify App Subscription Kit

A comprehensive boilerplate for building Shopify subscription-based applications using Remix, Shopify CLI, and Supabase. This kit handles dynamic subscription plans and includes App Bridge integration out of the box.

## 🌟 Features

- Built with Remix and Shopify CLI
- Supabase integration for database management
- Dynamic subscription plans handling
- App Bridge integration
- TypeScript support
- Pre-configured Shopify app settings
- Environment variable management

## 📋 Prerequisites

- Node.js (Latest LTS version recommended)
- Shopify CLI installed
- Supabase account
- Shopify Partner account

## 🚀 Getting Started

### 1. Environment Setup

First, copy the environment example file to create your own environment configuration:

```bash
cp .env.example .env
```

Fill in the following environment variables in your `.env` file:

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=your_scopes
HOST=your_host
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Authentication

Log in to your Shopify account using the CLI:

```bash
shopify login
```

### 3. Development

Start the development server:

```bash
shopify app dev
```

The app will be available at the URL provided by the Shopify CLI.

## 📦 Project Structure

```
├── app/
│   ├── routes/            # Application routes
│   ├── components/        # React components
│   ├── models/           # Data models
│   └── utils/            # Utility functions
├── public/               # Static assets
└── supabase/            # Supabase configurations
```

## 🔒 Security

- All sensitive information should be stored in environment variables
- Never commit your `.env` file
- Follow Shopify's security best practices
- Implement proper authentication checks

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please open an issue in the repository.

## ⚠️ Important Notes

- Always backup your data before making significant changes
- Test thoroughly in development before deploying to production
- Keep your dependencies updated
- Monitor your Supabase usage and limits

## 🔄 Updates and Maintenance

Regular updates will be provided to maintain compatibility with the latest Shopify API versions and security standards.
