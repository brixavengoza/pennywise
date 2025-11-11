import { useEffect, useState } from "react"

export const useDebounce = (value: string, delay: number) => {
	const [debounce, setDebounce] = useState(value)

	useEffect(() => {
		const timer = setTimeout(() => setDebounce(value))
		return () => clearTimeout(timer)
	}, [value, delay])

	return debounce;
}
