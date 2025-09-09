import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-toast'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
          editor: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-underline', '@tiptap/extension-text-style', '@tiptap/extension-font-family', '@tiptap/extension-color', '@tiptap/extension-text-align', '@tiptap/extension-highlight', '@tiptap/extension-table', '@tiptap/extension-table-row', '@tiptap/extension-table-cell', '@tiptap/extension-table-header', '@tiptap/extension-history'],
          pdf: ['jspdf', 'html2canvas', 'docx', 'file-saver']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
