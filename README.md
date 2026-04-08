
  # Requirements Traceability Matrix

  This is a code bundle for Requirements Traceability Matrix. The original project is available at https://www.figma.com/design/h85S5ICikFXBi0ASmQqk7s/Requirements-Traceability-Matrix.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Testing

  | Command | Description |
  |---|---|
  | `npm run test` | Run unit tests once |
  | `npm run test:watch` | Run unit tests in watch mode |
  | `npm run test:coverage` | Run unit tests with V8 coverage report |
  | `npm run test:e2e` | Run Playwright end-to-end tests |

  ### Coverage thresholds

  Coverage is enforced in CI via Vitest + `@vitest/coverage-v8`. The build **fails** if any threshold is not met.

  | Metric | Current threshold | Target (post #41–#43) |
  |---|---|---|
  | Statements | 45% | 80% |
  | Branches | 50% | 70% |
  | Functions | 30% | 80% |
  | Lines | 45% | 80% |

  Measured over: `src/app/utils/**`, `src/app/hooks/**`  
  Excluded: `src/app/components/ui/**` (shadcn generated), `src/app/data/**` (static seed data)

  The HTML coverage report is uploaded as a CI artifact (`coverage-report`) on every push.

  ### Environment variables

  Copy `.env.example` to `.env.local` and adjust as needed:

  ```
  VITE_LOG_LEVEL=info   # debug | info | warn | error
  ```

  ## AI Agents

  This project includes a suite of AI agents for architecture planning, code review, QA, and more.

  See **[agents/README.md](./agents/README.md)** for setup instructions, model configuration (GitHub Models or local Ollama), and a full command reference.
