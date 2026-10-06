# MCP Server Setup Guide

This project is configured with Model Context Protocol (MCP) servers for Next.js and Figma integration.

## MCPs Configured

### 1. Next.js MCP
- **Purpose**: Access Next.js project structure, routing, configuration, and development tools
- **Status**: Enabled by default
- **Features**:
  - Project file navigation
  - Route structure analysis
  - Configuration inspection
  - Development mode integration

### 2. Figma MCP
- **Purpose**: Access Figma design files, components, and design tokens
- **Status**: Requires API key setup
- **Features**:
  - Design file access
  - Component library integration
  - Design token extraction
  - Frame and element inspection

## Setup Instructions

### Figma MCP Setup (Required for Figma integration)

1. **Get Figma API Key**:
   - Go to [Figma Settings](https://www.figma.com/settings/api-tokens)
   - Click "Create a new token"
   - Give it a descriptive name (e.g., "Claude Code")
   - Copy the token

2. **Add to Environment**:
   
   **Option A: Local Environment (Recommended for development)**
   ```bash
   # Create .env.local in project root
   FIGMA_API_KEY=your_figma_api_token_here
   ```

   **Option B: Global Environment**
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export FIGMA_API_KEY=your_figma_api_token_here
   ```

3. **Verify Setup**:
   - Restart Claude Code or reload the session
   - The Figma MCP should now be available
   - Try asking Claude about your Figma designs

### Next.js MCP (Auto-enabled)

The Next.js MCP is automatically enabled and requires no additional setup. It will:
- Analyze your Next.js project structure
- Understand your routes and pages
- Access your Next.js configuration
- Provide development insights

## Using the MCPs

### With Claude Code

1. **Figma Design Reference**:
   ```
   "Check my Figma designs for the login page and suggest components to match"
   ```

2. **Next.js Structure**:
   ```
   "Review the Next.js route structure and suggest improvements"
   ```

3. **Combined Workflow**:
   ```
   "I have a design in Figma for a product card. Create the Next.js component to match it."
   ```

## Troubleshooting

### Figma MCP not connecting
- Verify your API key is correct
- Check that the key hasn't expired
- Ensure the environment variable is set: `echo $FIGMA_API_KEY`
- Restart Claude Code

### Next.js MCP not detecting changes
- Make sure you're running `npm run dev` before asking Claude for Next.js insights
- The MCP reads the current project state from disk

### MCP servers not loading
- Check `.mcp.json` is valid JSON
- Verify `npm` and `npx` are in your PATH
- Try running: `npx @anthropic/mcp-server-nextjs --help`
- Check `.claude/settings.json` has `enableAllProjectMcpServers: true`

## Security Notes

- **Never commit** your Figma API key to Git
- Use `.env.local` for development (it's in .gitignore)
- Consider using a service account token for team environments
- Rotate tokens regularly if they're compromised

## File References

- `.mcp.json` - MCP server definitions
- `.claude/settings.json` - Claude Code MCP configuration
- `.env.example` - Template for environment variables

## Learn More

- [Anthropic MCP Documentation](https://modelcontextprotocol.io/)
- [Figma API Reference](https://www.figma.com/developers/api)
- [Next.js Documentation](https://nextjs.org/docs)
