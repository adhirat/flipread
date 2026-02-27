# ShoPublish Mobile 📱

The mobile companion app for the ShoPublish platform, built with **Flutter**.

## 🚀 Features

- **Store Browser**: Browse and discover digital flipbooks.
- **Offline Reading**: Download and read your library on the go.
- **Member Access**: Log in to access private stores and premium content.

## 🛠️ Tech Stack

- **Framework**: Flutter
- **State Management**: Provider / Riverpod (Planned)
- **Local Storage**: SQFlite / Hive (Planned)
- **Networking**: Dio / Http

## 🔧 Getting Started

### Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install)
- Android Studio / VS Code with Flutter extensions
- Java 17+ (for Android)
- Xcode (for iOS)

### Installation

From the monorepo root:

```bash
cd apps/mobile
flutter pub get
```

### Running the App

```bash
flutter run
```

## 🤖 CI/CD

- **GitHub Actions**: Runs on every pull request to ensure code passes analysis and tests.
- **Codemagic**: Handles automated release builds for Android and iOS. See [`codemagic.yaml`](../../codemagic.yaml) in the root directory.
