import { useMemo, useState } from 'react';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';

import { FacetList } from '../FacetList/FacetList';
import { ThumbnailImage } from '../ThumbnailImage/ThumbnailImage';

import type { testResponse } from '../../interface/test';

// Joy
import Alert from '@mui/joy/Alert';
import Autocomplete from '@mui/joy/Autocomplete';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import LinearProgress from '@mui/joy/LinearProgress';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

// Icons
import SearchIcon from '@mui/icons-material/Search';

function SearchPage(props: {
	pageData?: testResponse | undefined,
}) {
	const {
		pageData = undefined,
	} = props;

	const [color, setColor] = useState<string>('#999');
	const theme = useMemo(
	  () =>
	    extendTheme({
	    	cssVarPrefix: "nested",
			  typography: {
			    fontFamily: {
			      display: 'Roboto',
			      body: 'Roboto',
			    }
			  },
			  colorSchemes: {
			    light: {
			      palette: {
			        primary: {
			          solidBg: color,
			          solidHoverBg: '#F38666',
			          outlinedBorder: color,
			          500: color,
			        }
			      }
			    },
			    dark: {
			      palette: {}
			    }
			  },
	    }),
	  [color],
	);

  return (
    <Box
      sx={{
        margin: 'auto',
        maxWidth: '1178px',
      }}
    >
		<Stack spacing={2} alignItems="center">
			<Stack spacing={1}>
				{pageData?.crawl?.status === 1 && (
					<Stack sx={{margin: 'auto', minWidth: 500}} spacing={3}>
						<Typography>
							Crawling your site
						</Typography>
						<LinearProgress variant="soft" />
					</Stack>
				)}
				{pageData?.crawl?.status === 2 && (
					pageData?.crawl?.data?.pageData?.length === 0 ? (
						<Alert>
							Couldn't find any pages
						</Alert>
					)
					: (
						<Stack spacing={0.5}>
							<Stack direction="row" spacing={0.5} alignItems="center">
								<Typography>
									Color
								</Typography>
								{pageData?.search?.data?.searchpage?.mainColors?.map((color: any, index: number) => (
									<Box
										key={index}
										onClick={() => setColor(`rgba(${color[0]}, ${color[1]}, ${color[2]})`)}
										sx={{
											borderRadius: '100%',
											height: 30,
											width: 30,
											backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]})`,
											boxShadow: '2px 2px 5px rgba(150, 150, 150, 0.5)'
										}}
									/>
								))}
							</Stack>
	    				<CssVarsProvider theme={theme} disableNestedContext>
								<Stack spacing={2}>
									<Alert variant="plain">
										<Box sx={{width: 200}}>
										</Box>
										<Autocomplete
											size="lg"	
											disabled
											value={`${pageData?.search?.data?.searchpage?.startURL?.replace('https://', '')} Search Demo`}
											options={[]}
		      						endDecorator={<SearchIcon />}
		      						sx={{width: 600}}
		      					/>
									</Alert>
									<Stack direction="row" spacing={3}>
										<FacetList facets={pageData?.crawl?.data?.facetData || []} />
										<Stack spacing={1}>
											<Alert variant="soft" color="primary">
												<Stack spacing={1}>
													<Typography component="h2">
														Add Promoted Search Results
													</Typography>
													<Typography>
														Create custom promotions for on-site and external websites
													</Typography>
													<Box>
														<Button color="primary">
															Learn More
														</Button>
													</Box>
												</Stack>
											</Alert>
											{pageData?.crawl?.data?.pageData
												?.slice(0, 10)
												.map((result: any, index: number) => (
												<Box
													key={index}
													component="a"
													href={result?.url}
													target="_blank"
													sx={(theme) => ({
														textDecoration: 'none',
														display: 'flex',
														height: '100%',
														width: '100%',
														border: 'solid',
														borderWidth: '2px',
														borderRadius: '5px',
														borderColor: theme.vars.palette.background.level1,
														p: '1px',
													})}
												>
													<Sheet
														sx={{
															p: 1
														}}
													>
														<Stack direction="row" spacing={2}>
															{result.image !== '' && (
																<ThumbnailImage imageURL={result.image} />
															)}
															<Stack spacing={1}>
																<Box
																	sx={{
																		fontWeight: 700
																	}}
																>
																	{result.title}
																</Box>
																<Box>
																	{result.description ? result.description : result.text.substring(0, 300)}
																</Box>
																<Box
																	sx={{
																		fontSize: 12
																	}}
																>
																	{result.url}
																</Box>
															</Stack>
														</Stack>
													</Sheet>
												</Box>
											))}
											<Stack direction="row" justifyContent="space-between" alignItems="center">
												<Button disabled variant="plain">
													Previous
												</Button>
												<Typography>
													Showing results 1 - 10
												</Typography>
												<Button variant="plain">
													Next
												</Button>
											</Stack>
										</Stack>
									</Stack>
								</Stack>
	    				</CssVarsProvider>
	    			</Stack>
					)
				)}
				{pageData?.crawl?.status === -1 && (
					<Alert color="danger">
						{`Unable to crawl that URL`}
					</Alert>
				)}
			</Stack>
		</Stack>
	</Box>
  )
}

export default SearchPage
