import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CRITICAL SCHEMEFORGE REACT RUNTIME EXCEPTION:", error);
    console.error("COMPONENT STACK TRACE:", errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center p-6 text-[#4C3D19]">
          <div className="max-w-xl w-full bg-white p-8 rounded-3xl border border-[#CFBB99] shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#4C3D19]">Temporary Interface Notice</h3>
            <p className="text-xs text-[#4C3D19]/70">
              An unexpected error occurred while displaying this section. Your session state remains secure.
            </p>

            {/* Detailed Debug Stack Trace Output for Tester */}
            {this.state.error && (
              <details className="text-left bg-red-50 border border-red-200 p-4 rounded-xl text-[11px] font-mono text-red-900 overflow-x-auto my-3">
                <summary className="font-bold cursor-pointer text-red-700 mb-2">View Error Exception Trace</summary>
                <div className="whitespace-pre-wrap font-bold text-red-900">
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo && (
                  <div className="mt-2 whitespace-pre-wrap text-[10px] text-red-800 opacity-90 border-t border-red-200 pt-2">
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </details>
            )}

            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 rounded-full btn-cafe text-xs font-bold inline-flex items-center space-x-2 cursor-pointer"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
