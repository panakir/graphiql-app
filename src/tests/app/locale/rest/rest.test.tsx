import Page from "@/app/[locale]/rest/page";
import { IntlProviderWrapper } from "@/tests/utils/test-utils";
import { render, screen } from "@testing-library/react";
import { Mock } from "vitest";
import { useParams } from "next/navigation";
import { convertToBase64 } from "@/utils/convertBase64";
import { useSelector } from "react-redux";

vi.mock("@/navigation", () => ({
  useParams: () => ({ locale: "en" }),
  usePathname: () => "/",
  useRouter: () => ({ replace: vi.fn() }),
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock("react-dom", () => ({
  useFormState: vi.fn(() => [null, vi.fn()]),
  useFormStatus: vi.fn(() => ({ pending: false })),
}));

describe("RestClientPage", () => {
  beforeEach(() => {
    (useParams as Mock).mockReturnValue({
      method: "GET",
      requestUrl: [
        convertToBase64("https://example.com/api"),
        convertToBase64("somebody"),
      ],
    });
    (useSelector as unknown as Mock).mockReturnValue([]);
  });

  it("should render the correct header text and button text", () => {
    render(
      <IntlProviderWrapper>
        <Page />
      </IntlProviderWrapper>
    );

    expect(screen.getByText("REST Client")).toBeInTheDocument();
    expect(screen.getByText("Method")).toBeInTheDocument();
    expect(screen.getByText("URL")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add header" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });
});