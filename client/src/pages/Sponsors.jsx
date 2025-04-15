export default function Sponsors() {
	const sponsorsList = [
		{
			name: 'Marketo',
			logo: 'https://imgs.search.brave.com/ustk7Z98K79ZocjI0nXxrIp7qkUh_yj7kCu1gw172VA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/cHJvZC53ZWJzaXRl/LWZpbGVzLmNvbS82/M2E5ZmI5NGU0NzNm/MzZkYmU5OWMxYjEv/NjcyYTE2YmY0ZWJk/OWJlMGJmOTgwMjY4/XzY1MWJjODA3ZGZh/NzU5OTQ5ODIxZDcw/OF9KNnBvWVpvOVRH/eUUyejZLSXRtOS5q/cGVn',
			website: 'https://techgiants.com',
		},
		{
			name: 'Google.',
			logo: 'https://imgs.search.brave.com/WFUCWSTA1WQZxQ6Bj0PpSiIS0qx9cb9e-ysxkOY4rTA/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jZG4x/Lmljb25maW5kZXIu/Y29tL2RhdGEvaWNv/bnMvZ29vZ2xlLXMt/bG9nby8xNTAvR29v/Z2xlX0ljb25zLTA5/LTUxMi5wbmc',
			website: 'https://google.com',
		},
		{
			name: 'Tesla',
			logo: 'https://imgs.search.brave.com/JjUHUUVpNISmXgj-ViCbEuqGIlxqXNc3ovSFLIEElTc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zZWVr/bG9nby5jb20vaW1h/Z2VzL1QvdGVzbGEt/aW5jLWxvZ28tREM3/RjE5MkFGQy1zZWVr/bG9nby5jb20ucG5n',
			website: 'https://tesla.com',
		},
		{
			name: 'Meta',
			logo: 'https://imgs.search.brave.com/uU0bbL7a8VHe8UstHE4lGkJC5FomSK8_T4mwWSKLtZ4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMuc3RpY2twbmcu/Y29tL2ltYWdlcy82/MWZhZTJkMzk1ZTZj/YTAwMDQ3YjRmMTIu/cG5n',
			website: 'https://meta.com',
		},
	];

	// Randomly select 3 sponsors
	const selectedSponsors = sponsorsList
		.sort(() => 0.5 - Math.random())
		.slice(0, 3);

	return (
		<div className="bg-gray-100 p-6 rounded-lg shadow-md mt-10">
			<h2 className="font-bold text-[24px] mb-5 text-center">
				Sponsors of the Day
			</h2>
			<div className="flex justify-center gap-10">
				{selectedSponsors.map((sponsor, index) => (
					<a
						key={index}
						href={sponsor.website}
						target="_blank"
						rel="noopener noreferrer"
						className="text-center">
						<img
							src={sponsor.logo}
							alt={sponsor.name}
							className="w-32 h-32 rounded-full border-2 border-sky-700 shadow-lg hover:scale-105 transition-transform"
						/>
						<p className="mt-3 font-semibold text-lg">{sponsor.name}</p>
					</a>
				))}
			</div>
		</div>
	);
}
